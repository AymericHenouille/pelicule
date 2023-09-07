import { parse } from 'exifr';
import { Stats } from 'fs';
import { readFile, stat } from 'fs/promises';
import { DateInfo, MediaInfo } from '../models/report.model';
import { Transformer } from '../models/transform.model';

export class DateTransformer implements Transformer<Partial<MediaInfo>, Partial<MediaInfo>> {

  public readonly transformerName: string = 'Dating';

  public async transform(mediaInfo: Partial<MediaInfo>): Promise<Partial<MediaInfo>> {
    const date: Date = await this.findDate(mediaInfo?.path ?? '');
    return {
      ...mediaInfo,
      date: this.parseDateToDateInfo(date),
    };
  }

  private parseDateToDateInfo(date: Date): DateInfo {
    return {
      year: `${date.getFullYear()}`,
      month: `${date.getMonth() + 1}`,
      day: `${date.getDate()}`,
    };
  }

  private async findDate(path: string): Promise<Date> {
    try {
      const buffer: Buffer = await readFile(path);
      const exif: any = await parse(buffer);
      return (exif?.DateTimeOriginal || exif?.CreateDate || exif?.ModifyDate) 
        ?? this.getCreationDate(path);
    } catch (error) { return this.getCreationDate(path); }
  }

  private async getCreationDate(path: string): Promise<Date> {
    const stats: Stats = await stat(path);
    return stats.mtime;
  }

}