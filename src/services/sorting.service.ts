import chalk from 'chalk';
import { mkdir, rename } from 'fs/promises';
import { ParsedPath, basename, join, parse } from 'path';
import { SortArgument } from '../models/arguments.model';
import { MediaInfo } from '../models/report.model';
import { WorkerStatus } from '../models/worker-status.model';
import { PatternService } from './pattern.service';

/**
 * Transform a relative path to an absolute path.
 * @param folder The folder where the file is located.
 * @param path The relative path of the file.
 * @returns The absolute path of the file.
 */
function buildPath(folder: string, path: string): string {
  return join(folder, path);
}

function buildSortUpdate(path: string, index: number): WorkerStatus<MediaInfo> {
  return {
    status: 'progress',
    progress: {
      stepName: 'Sorting',
      target: chalk.blue(basename(path)),
      processProgress: index + 1,
    },
    result: [],
  };
}

function buildDone<T>(stepName: string, result: T[], total: number): WorkerStatus<T> {
  return {
    status: 'done',
    progress: {
      stepName,
      target: chalk.green('done'),
      processProgress: total,
    },
    result,
  };
}

export class SortingService {

  public constructor(
    private readonly argv: SortArgument,
  ) { }

  public async sorting(files: MediaInfo[], chunk: MediaInfo[], update: (status: WorkerStatus<MediaInfo>) => void): Promise<void> {
    const folder: string = this.argv.folder;
    for (let index: number = 0 ; index < chunk.length ; ++index) {
      const media: MediaInfo = chunk[index];
      const patternService: PatternService = new PatternService(this.argv);
      const targetPath: string = buildPath(folder, media.path);
      const destPath: string = buildPath(folder, patternService.parse(media));
      try {
        await this.moveFile(targetPath, destPath);
        media.path = destPath.replace(folder, '.');
      } catch (error) {
        console.error(error);
      }
      update(buildSortUpdate(media.path, index));
    }
    update(buildDone('Sorting', chunk, chunk.length));
  }

  /**
   * Move a file from a source to a target.
   * If the target directory does not exist, it will be created.
   * If the copy succeed, the source file will be deleted.
   * If the copy failed, the source file will not be deleted.
   * 
   * If the target file already exist, it will be deleted before the copy.
   * 
   * @param source The source file.
   * @param target The target file.
   */
  private async moveFile(source: string, target: string): Promise<void> {
    const { dir }: ParsedPath = parse(target);
    await mkdir(dir, { recursive: true });
    await rename(source, target);
  }
}