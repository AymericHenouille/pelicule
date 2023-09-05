import chalk from 'chalk';
import { MultiBar, Presets, SingleBar } from 'cli-progress';
import { join } from 'path';
import { PassThrough } from 'stream';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { Argument } from '../models/arguments.model';
import { WorkerData, WorkerProgress, WorkerStatus } from '../models/worker-status.model';
import { log } from '../utils/log.util';
import { Dispatcher, DispatcherService } from './dispatcher.service';

if (!isMainThread) {
  const { items, chunk, job, argv }: WorkerData<unknown, unknown> = workerData;
  const dispatcherService: DispatcherService<typeof argv> = new DispatcherService<typeof argv>(argv);
  dispatcherService.dispatch(job, items, chunk, (status: WorkerStatus<unknown>) => parentPort?.postMessage(status));
}

/**
 * A service to run jobs in parallel.
 * It will run each job in a separate thread.
 * It will split the items into chunks and run the job on each chunk.
 */
export class WorkerService<A> {

  /**
   * The path to the worker file.
   *
   * @private
   * @static
   * @type {string}
   * @memberof WorkerService
   */
  private static readonly URL: string = join(__dirname, './worker.service.js');

  public constructor(
    private readonly argv: Argument<A>, 
  ) { }

  /**
   * Run a job based on a list of items.
   * It will split the items into chunks and run the job on each chunk.
   * Each chunk will be run in a separate thread.
   * 
   * @param items The items to process.
   * @param jobs The jobs to run.
   * @returns The compiled results of the jobs.
   */
  public async runJobs<T, R>(items: T[], job: Dispatcher): Promise<R[]> {
    const chunks: T[][] = this.buildChunks(items, this.argv.workers);
    const multiBar: MultiBar = new MultiBar({
      format: '{stepName} [{bar}] {value}/{total} | {target}',
      hideCursor: true,
      stream: this.argv.verbose ? process.stdout : new PassThrough(),
      formatValue: (value: number, _, type: string) => {
        if (type === 'total') return chalk.bold(value.toString());
        if (type === 'value') {
          const length: number = value.toString().length;
          const targetLength: number = chunks[0].length.toString().length;
          const padding: string = ' '.repeat(targetLength - length);
          const formatedValue: string = padding + value;
          return chalk.gray(formatedValue);
        }
        return value.toString();
      },
    }, Presets.shades_grey);
    log(this.argv, `Running ${chalk.magenta(chunks.length)} chunks of ${chalk.bold(chunks[0].length)} jobs...`);
    const results: PromiseSettledResult<R[]>[] = await Promise.allSettled(chunks.map((chunk: T[]) => this.runChunk<T, R>(items, chunk, job, multiBar)));
    multiBar.stop();
    if (this.argv.verbose) console.clear();
    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<R[]>).value)
      .flat();
  }

  /**
   * Run a job on a chunk of items.
   * @param items The items to process.
   * @param chunk The chunk of items to process.
   * @param job The job to run.
   * @param multiBar The multi bar to update.
   * @returns The compiled results of the job.
   */
  private runChunk<T, R>(items: T[], chunk: T[], job: Dispatcher, multiBar: MultiBar): Promise<R[]> {
    const bar: SingleBar = multiBar.create(chunk.length, 0);
    bar.update(0, { stepName: job, target: chalk.yellow('starting') });
    this.readChunkMessage({
      status: 'progress',
      progress: { 
        processProgress: 0,
        stepName: job,
        target: chalk.yellow('starting')
      },
      result: [],
    }, bar, () => { });
    const workerData: WorkerData<T, A> = { items, chunk, job, argv: this.argv };
    const worker: Worker = new Worker(WorkerService.URL, { workerData });
    return new Promise((resolve, reject) => worker
      .on('message', (message: WorkerStatus<R>) => this.readChunkMessage(message, bar, resolve))
      .on('error', (error: ErrorEvent) => { bar.stop(); reject(error);  })
      .on('exit', (code: number) => {
        if (code !== 0) {
          bar.stop();
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      })
    );
  }

  /**
   * Read a message from a worker.
   * And update the progress bar.
   * @param message The message to read.
   * @param bar The progress bar to update.
   * @param resolve The resolve function of the promise. It will be called when the job is done.
   */
  private readChunkMessage<T, R>(message: WorkerStatus<R>, bar: SingleBar, resolve: (value: R[]) => void): void {
    const progress: WorkerProgress = message.progress;
    bar.update(progress.processProgress, {
      stepName: chalk.bold(progress.stepName),
      target: progress.target
    });
    if (message.status === 'done') resolve(message.result);
  } 

  /**
   * Split an array into chunks.
   * @param array The array to split.
   * @param chunksNumber The number of chunks.
   * @returns The array of chunks.
   */
  private buildChunks<T>(array: T[], chunksNumber: number): T[][] {
    type MapFn = (value: T, index: number) => T[];
    const finalChunksNumber: number = Math.min(array.length, chunksNumber);
    const chunkSize: number = Math.ceil(array.length / finalChunksNumber);
    const mapFn: MapFn = (_, index) => this.shuffle(array)
      .slice(index * chunkSize, (index + 1) * chunkSize);
    return Array.from({ length: chunksNumber }, mapFn);
  }

  /**
   * Shuffle an array.
   * @param array The array to shuffle.
   * @returns The shuffled array.
   */
  private shuffle<T>(array: T[]): T[] {
    const shuffled: T[] = [...array];
    for (let index: number = shuffled.length - 1 ; index > 0 ; --index) {
      const randomIndex: number = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
  }
    
}