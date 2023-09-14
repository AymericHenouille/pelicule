import { resolve } from 'path';
import { AnalyseArgument } from '../models/arguments.model';
import { MediaInfo } from '../models/report.model';
import { TransformProgress, TransformerProcessor } from '../models/transform.model';
import { Dispatcher, WorkerData } from '../models/worker-status.model';
import { MediaInfoChainTransformerProcessor } from './media-info-chain-processor.transformer';
import { AbsolutePathTransformer } from './transformers/absolute-path.transformer';
import { CompareTransformer } from './transformers/compare.transformer';
import { DateTransformer } from './transformers/date.transformer';
import { HashTransformer } from './transformers/hash.transformer';
import { RelativePathTransformer } from './transformers/relative-path.transformer';

export type DispatcherCallback<T> = (status: TransformProgress<T>) => void;
export type DispatcherFn<T> = (callback: DispatcherCallback<T>) => Promise<T[]>;

type TransformerFactory<T, A> = (data: WorkerData<T, A>) => TransformerProcessor<T, T>;
type ProcessorWithKeys = { [key in Dispatcher]: TransformerFactory<unknown, unknown> };

/**
 * The processors for the different jobs.
 */
const PROCESSORS: ProcessorWithKeys = {
  analyse: (_: WorkerData<unknown, unknown>) => {
    return new MediaInfoChainTransformerProcessor([
      new AbsolutePathTransformer(),
      new HashTransformer(),
      new DateTransformer(),
    ]);
  },
  compare: (data: WorkerData<unknown, unknown>) => {
    const argv: AnalyseArgument = data.argv as AnalyseArgument;
    const items: MediaInfo[] = data.items as MediaInfo[];
    const folder: string = resolve(argv.folder);
    return new MediaInfoChainTransformerProcessor([
      new CompareTransformer(argv, items),
      new RelativePathTransformer(folder),
    ]);
  },
}

/**
 * Dispatch the data to the correct processor.
 * @param data The data to dispatch.
 * @returns The dispatcher function.
 */
export function dispatch<T, A>(data: WorkerData<T, A>): DispatcherFn<T> {
  return (callback: DispatcherCallback<T>) => {
    const key: Dispatcher = data.job;
    const processorFactory: TransformerFactory<T, A> = PROCESSORS[key] as TransformerFactory<T, A>;
    const processor: TransformerProcessor<T, T> = processorFactory(data);
    return processor.transform(data.chunk, (progress: TransformProgress<T>) => callback(progress));
  };
}