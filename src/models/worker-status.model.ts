import { Dispatcher } from '../services/dispatcher.service';

export type WorkerData<T, A> = { items: T[], chunk: T[], job: Dispatcher, argv: A };

/**
 * The progress of a worker.
 *
 * @export
 * @interface WorkerProgress
 */
export interface WorkerProgress {
  /**
   * The name of the current step.
   */
  stepName: string;
  /**
   * The target of the current step.
   */
  target: string;
  /**
   * The progress of the current step.
   */
  processProgress: number;
}

export interface WorkerStatus<T, A, R> {
  status: 'done' | 'progress' | 'error';
  progress: WorkerProgress;
  result: R[];
}