import { join } from 'path';
import { SortArgument } from '../models/arguments.model';
import { CommandHandler } from '../models/handler.model';
import { MediaInfo } from '../models/report.model';
import { FileExplorer } from '../services/file-explorer.service';
import { WorkerService } from '../services/worker.service';
import { formatTimeMesage, log } from '../utils/log.util';

export function sortCommandHandler(): CommandHandler<SortArgument> {
  return async (argv: SortArgument) => {
    const startTick: number = performance.now();
    const pscFile: string = argv.output ?? join(argv.folder, '.psc.json');
    const fileExplorer: FileExplorer = new FileExplorer(argv.folder, argv);
    const workerService: WorkerService<SortArgument> = new WorkerService<SortArgument>(argv);
    const analyse: MediaInfo[] = await fileExplorer.readJson<MediaInfo[]>(pscFile, []);
    try {
      const sorted: MediaInfo[] = await workerService.runJobs<MediaInfo, MediaInfo>(analyse, 'sorting');
      await fileExplorer.removeEmptyFolders();
      await fileExplorer.writeJson(pscFile, sorted);
      log(argv, `Sorted ${sorted.length} files in ${formatTimeMesage(performance.now() - startTick)}`);
    } catch (error) {
      console.error(error);
    }
  }
}