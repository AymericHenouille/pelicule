import { AnalyseArgument } from '../models/arguments.model';
import { MediaInfo } from '../models/report.model';
import { TransformProgress, TransformerProcessor } from '../models/transform.model';
import { Dispatcher, WorkerData } from '../models/worker-status.model';
import { AbsolutePathTransformer } from './absolute-path.transformer';
import { CompareTransformer } from './compare.transformer';
import { HashTransformer } from './hash.transformer';
import { MediaInfoChainTransformerProcessor } from './media-info-chain-processor.transformer';
import { RelativePathTransformer } from './relative-path.transformer';

export type DispatcherCallback<T> = (status: TransformProgress<T>) => void;
export type DispatcherFn<T> = (callback: DispatcherCallback<T>) => Promise<T[]>;

type TransformerFactory<T, A> = (data: WorkerData<T, A>) => TransformerProcessor<T, T>;
type ProcessorWithKeys = { [key in Dispatcher]: TransformerFactory<unknown, unknown> };

const PROCESSORS: ProcessorWithKeys = {
  analyse: (data: WorkerData<unknown, unknown>) => {
    // const argv: Argument<unknown> = data.argv as Argument<unknown>;
    // const folder: string = argv.folder;
    return new MediaInfoChainTransformerProcessor([
      // new AbsolutePathTransformer(folder),
      new HashTransformer(),
      // new DateTransformer(),
      // new RelativePathTransformer(folder),
    ]);
  },
  compare: (data: WorkerData<unknown, unknown>) => {
    const argv: AnalyseArgument = data.argv as AnalyseArgument;
    const items: MediaInfo[] = data.items as MediaInfo[];
    const folder: string = argv.folder;
    return new MediaInfoChainTransformerProcessor([
      new AbsolutePathTransformer(folder),
      new CompareTransformer(argv, items),
      new RelativePathTransformer(folder),
    ]);
  },
}

export function dispatch<T, A>(data: WorkerData<T, A>): DispatcherFn<T> {
  return (callback: DispatcherCallback<T>) => {
    const key: Dispatcher = data.job;
    const processorFactory: TransformerFactory<T, A> = PROCESSORS[key] as TransformerFactory<T, A>;
    const processor: TransformerProcessor<T, T> = processorFactory(data);
    return processor.transform(data.chunk, (progress: TransformProgress<T>) => callback(progress));
  };
}