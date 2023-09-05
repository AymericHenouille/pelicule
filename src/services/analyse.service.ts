import chalk from 'chalk';
import { parse } from 'exifr';
import { Stats } from 'fs';
import { readFile, stat } from 'fs/promises';
import Jimp, { compareHashes, create } from 'jimp';
import { basename } from 'path';
import { AnalyseArgument } from '../models/arguments.model';
import { DateInfo, MediaInfo } from '../models/report.model';
import { WorkerStatus } from '../models/worker-status.model';

function buildCompareUpdate(path: string, index: number): WorkerStatus<MediaInfo> {
  return {
    status: 'progress',
    progress: {
      stepName: 'Comparing',
      target: chalk.blue(basename(path)),
      processProgress: index + 1,
    },
    result: [],
  };
}

function buildHashUpdate(path: string, index: number): WorkerStatus<MediaInfo> {
  return {
    status: 'progress',
    progress: {
      stepName: 'Hashing',
      target: chalk.blue(basename(path)),
      processProgress: index + 1,
    },
    result: [],
  };
}

function buildDatingUpdate(path: string, index: number): WorkerStatus<MediaInfo> {
  return {
    status: 'progress',
    progress: {
      stepName: 'Dating',
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

export class AnalyseService {

  public constructor(
    private readonly argv: AnalyseArgument,
  ) { }

  public async hashing(items: string[], chunk: string[], update: (status: WorkerStatus<MediaInfo>) => void): Promise<void> {
    const result: MediaInfo[] = [];
    for (let index: number = 0 ; index < chunk.length ; ++index) {
      const path: string = chunk[index];
      const hash: string | null = await this.hash(path);
      result.push({ 
        path, 
        hash,
        copy: [],
        tags: [],
      });
      update(buildHashUpdate(path, index));
    }
    update(buildDone('Hashing', result, chunk.length));
  }

  public async compare(items: MediaInfo[], chunk: MediaInfo[], update: (status: WorkerStatus<MediaInfo>) => void): Promise<void> {
    const targetRootDir: string = this.argv.folder;
    const result: MediaInfo[] = [];
    for (let index: number = 0 ; index < chunk.length ; ++index) {
      const media: MediaInfo = chunk[index];
      result.push({
        path: media.path,
        hash: media.hash,
        copy: items.filter((item: MediaInfo) => {
          if (item.path === media.path) return false;
          if (item.hash === null || media.hash === null) return false;
          const distance: number = compareHashes(item.hash, media.hash);
          return distance <= this.argv.distance;
        }).map((item: MediaInfo) => item.path.replace(targetRootDir, '.')),
        tags: [],
      });
      update(buildCompareUpdate(media.path, index));
    }
    update(buildDone('Comparing', result, chunk.length));
  }

  public async dating(items: MediaInfo[], chunk: MediaInfo[], update: (status: WorkerStatus<MediaInfo>) => void): Promise<void> {
    const targetRootDir: string = this.argv.folder;
    const result: MediaInfo[] = [];
    for (let index: number = 0 ; index < chunk.length ; ++index) {
      const { path, hash, copy, tags }: MediaInfo = chunk[index];
      result.push({
        path: path.replace(targetRootDir, '.'),
        hash,
        copy,
        tags,
        date: this.buildDateInfo(await this.findDate(path)),
      });
      update(buildDatingUpdate(path, index));
    }
    update(buildDone('Dating', result, chunk.length));
  }

  private buildDateInfo(date: string): DateInfo {
    const [year, month, day]: string[] = date.split('-');
    return { year, month, day };
  }

  private async findDate(path: string): Promise<string> {
    try {
      const buffer: Buffer = await readFile(path);
      const exif: any = await parse(buffer);
      const date: Date | undefined = exif?.DateTimeOriginal || exif?.CreateDate || exif?.ModifyDate;
      return date?.toISOString().split('T')[0] || this.getCreationDate(path);
    } catch (error) { return this.getCreationDate(path); }
  }

  private async getCreationDate(path: string): Promise<string> {
    const stats: Stats = await stat(path);
    return stats.mtime.toISOString().split('T')[0];
  }

  private async hash(path: string): Promise<string | null> {
    try {
      const image: Jimp = await create(path);
      return image.hash();
    } catch (error) { return null; }
  }

  

}