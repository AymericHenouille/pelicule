import { parse } from 'exifr';
import { Stats } from 'fs';
import { readFile, stat } from 'fs/promises';
import { basename } from 'path';
import { DateInfo, MediaInfo } from '../../models/report.model';
import { Transformer } from '../../models/transform.model';
import { dateFromFileName } from './date-parser/index';

export class DateTransformer implements Transformer<Partial<MediaInfo>, Partial<MediaInfo>> {

  public readonly transformerName: string = 'Dating';

  public async transform(mediaInfo: Partial<MediaInfo>): Promise<Partial<MediaInfo>> {
    if (mediaInfo.date !== undefined && mediaInfo.date !== null) return mediaInfo;
    const tags: string[] = mediaInfo.tags ?? [];
    const date: Date = await this.findDate(mediaInfo?.path ?? '', tags);
    const parsedDate: DateInfo = this.parseDateToDateInfo(date);
    return Object.assign(mediaInfo, { date: parsedDate, tags });
  
  }

  private parseDateToDateInfo(date: Date): DateInfo {
    return {
      year: `${date.getFullYear()}`,
      month: `${date.getMonth() + 1}`,
      day: `${date.getDate()}`,
    };
  }

  /**
   * Find the date of the file. 
   * It will first try to find the date in the exif data.
   * If it can't find it, it will try to find the date by the file name or the last modification date file.
   * @param path The path of the file.
   * @param tags The tags of the file.
   * @returns The date of the file.
   */
  private async findDate(path: string, tags: string[]): Promise<Date> {
    try {
      const buffer: Buffer = await readFile(path);
      const exif: any = await parse(buffer);
      return (exif?.DateTimeOriginal || exif?.CreateDate || exif?.ModifyDate) 
        ?? this.getDateByFileName(path, tags);
    } catch (error) { return this.getDateByFileName(path, tags); }
  }

  private async getDateByFileName(path: string, tags: string[]): Promise<Date> {
    const fileName: string = basename(path);
    const date: Date | null = await dateFromFileName(fileName);
    if (date) {
      tags.push('date_from_file_name');
      return date;
    }
    return this.getCreationDate(path, tags);
  }

  private async getCreationDate(path: string, tags: string[]): Promise<Date> {
    const stats: Stats = await stat(path);
    tags.push('approximate_date');
    return stats.mtime;
  }

}