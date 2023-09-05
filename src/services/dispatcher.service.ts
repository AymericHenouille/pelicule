import { AnalyseArgument, SortArgument } from '../models/arguments.model';
import { MediaInfo } from '../models/report.model';
import { WorkerStatus } from '../models/worker-status.model';
import { AnalyseService } from './analyse.service';
import { SortingService } from './sorting.service';

export type Dispatcher = 'hashing' | 'compare' | 'dating' | 'sorting';

export class DispatcherService<A> {

  public constructor(
    private readonly argv: A,
  ) { }

  public async dispatch<T, R>(dispatcher: Dispatcher, items: T[], chunk: T[], update: (status: WorkerStatus<R>) => void): Promise<void> {
    switch (dispatcher) {
      case 'hashing':
        return new AnalyseService(this.argv as AnalyseArgument).hashing(
          items as string[], 
          chunk as string[], 
          update as (status: WorkerStatus<MediaInfo>) => void
        );
      case 'compare':
        return new AnalyseService(this.argv as AnalyseArgument).compare(
          items as MediaInfo[],
          chunk as MediaInfo[],
          update as (status: WorkerStatus<MediaInfo>) => void
        );
      case 'dating':
        return new AnalyseService(this.argv as AnalyseArgument).dating(
          items as MediaInfo[],
          chunk as MediaInfo[],
          update as (status: WorkerStatus<MediaInfo>) => void
        );
      case 'sorting':
        return new SortingService(this.argv as SortArgument).sorting(
          items as MediaInfo[],
          chunk as MediaInfo[],
          update as (status: WorkerStatus<MediaInfo>) => void
        );
      default:
        throw new Error(`Unknown dispatcher: ${dispatcher}`);
    }
  }

}