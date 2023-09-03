import chalk from 'chalk';
import { MultiBar, Presets, SingleBar } from 'cli-progress';
import { join } from 'path';
import { PassThrough } from 'stream';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { Argument } from '../models/arguments.model';
import { WorkerData, WorkerProgress, WorkerStatus } from '../models/worker-status.model';
import { Dispatcher, DispatcherService } from './dispatcher.service';

if (!isMainThread) {
  const { items, chunk, job, argv }: WorkerData<unknown, unknown> = workerData;
  const dispatcherService: DispatcherService<typeof argv> = new DispatcherService<typeof argv>(argv);
  dispatcherService.dispatch(job, items, chunk, (status: WorkerStatus<unknown, unknown, unknown>) => parentPort?.postMessage(status));
}

export class WorkerService<A> {

  private static readonly URL: string = join(__dirname, './worker.service.js');

  public constructor(
    private readonly argv: Argument<A>, 
  ) { }

  /**
   * Run a chunk of jobs.
   * @param jobs The jobs to run.
   * @returns The results of the jobs.
   */
  public async runJobs<T, R>(items: T[], job: Dispatcher): Promise<R[]> {
    const chunks: T[][] = this.buildChunks(items, this.argv.workers);
    const multiBar: MultiBar = new MultiBar({
      format: '{stepName} [{bar}] {value}/{total} | {target}',
      hideCursor: true,
      stopOnComplete: true,
      emptyOnZero: true,
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
    if (this.argv.verbose) console.log(`Running ${chalk.magenta(chunks.length)} chunks of ${chalk.bold(job)} jobs...`);
    const results: PromiseSettledResult<R[]>[] = await Promise.allSettled(chunks.map((chunk: T[]) => this.runChunk<T, R>(items, chunk, job, multiBar)));
    multiBar.stop();
    if (this.argv.verbose) console.clear();
    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<R[]>).value)
      .flat();
  }

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
      .on('message', (message: WorkerStatus<T, A, R>) => this.readChunkMessage(message, bar, resolve))
      .on('error', (error: ErrorEvent) => { bar.stop(); reject(error);  })
      .on('exit', (code: number) => {
        if (code !== 0) {
          bar.stop();
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      })
    );
  }

  private readChunkMessage<T, R>(message: WorkerStatus<T, A, R>, bar: SingleBar, resolve: (value: R[]) => void): void {
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
    const mapFn: MapFn = (_, index) => array.slice(index * chunkSize, (index + 1) * chunkSize);
    return Array.from({ length: chunksNumber }, mapFn);
  }
    
}