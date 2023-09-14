import chalk from 'chalk';
import { MultiBar, Presets, SingleBar } from 'cli-progress';
import { join } from 'path';
import { PassThrough } from 'stream';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { Argument } from '../models/arguments.model';
import { TransformProgress } from '../models/transform.model';
import { Dispatcher, WorkerData } from '../models/worker-status.model';
import { DispatcherFn, dispatch } from '../transform/dispatcher.transform';
import { chunk, shuffle } from '../utils/list.util';
import { log } from '../utils/log.util';

if (!isMainThread) {
  const dispatcher: DispatcherFn<unknown> = dispatch(workerData);
  dispatcher((status: TransformProgress<unknown>) => parentPort?.postMessage(status))
    .catch((error: Error) => parentPort?.postMessage({ status: 'error', error }));
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
    const shuffledItems: T[] = shuffle(items);
    const chunks: T[][] = chunk(shuffledItems, this.argv.workers);
    const multiBar: MultiBar = this.createMultibar(chunks);
    const chunkResults: Promise<R[]>[] = chunks.map((chunk: T[]) => this.runChunk<T, R>(items, chunk, job, multiBar))
    const results: R[][] = (await Promise.allSettled(chunkResults))
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<R[]>).value);
    multiBar.stop();
    if (this.argv.verbose) console.clear();
    return results.flat();
  }

  private runChunk<T, R>(items: T[], chunk: T[], job: Dispatcher, multiBar: MultiBar): Promise<R[]> {
    const bar: SingleBar = multiBar.create(chunk.length, 0);
    bar.update(0, { stepName: job, target: chalk.yellow('starting') });
    this.readChunkMessage({
      status: 'progress',
      progress: { 
        step: 0,
        total: chunk.length,
        stepName: job,
        target: chalk.yellow('starting')
      },
    }, bar);
    const workerData: WorkerData<T, A> = { items, chunk, job, argv: this.argv };
    const worker: Worker = new Worker(WorkerService.URL, { workerData });
    return new Promise((resolve, reject) => worker
      .on('message', (message: TransformProgress<R>) => this.readChunkMessage(message, bar, resolve, reject))
      .on('error', (error: ErrorEvent) => { bar.stop(); reject(error); })
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
  private readChunkMessage<R>(message: TransformProgress<R>, bar: SingleBar, resolve?: (value: R[]) => void, reject?: (error: Error) => void): void {
    const progress: TransformProgress<R[]>['progress'] = message.progress;
    bar.update(progress?.step ?? 0, {
      stepName: progress?.stepName,
      target: progress?.target,
    });
    if (message.status === 'done') resolve?.((message?.result ?? []) as R[]);
    if (message.status === 'error') {
      bar.stop();
      reject?.(message.error ?? new Error('Unknown error'));
    }
  }

  private createMultibar<T>(chunks: T[][]): MultiBar {
    const chunksSize: number = Math.max(...chunks.map((chunk: T[]) => chunk.length));
    const chunksSizeLength: number = chunksSize.toString().length;
    log(this.argv, `Running ${chalk.magenta(chunks.length)} chunks of ${chalk.bold(chunksSize)} jobs...`);
    return new MultiBar({
      format: '{stepName} [{bar}] {value}/{total} {target}',
      hideCursor: true,
      stream: this.argv.verbose ? process.stdout : new PassThrough(),
      formatValue: (value: number, _, type: string) => {
        if (type === 'total') return chalk.bold(value.toString());
        if (type === 'value') {
          const {length}: string = value.toString();
          const padding: string = ' '.repeat(chunksSizeLength - length);
          return chalk.gray(padding + value);
        }
        return value.toString();
      },
    }, Presets.shades_grey);
  }
    
}