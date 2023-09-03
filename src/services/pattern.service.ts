import { basename, join, sep } from 'path';
import { SortArgument } from '../models/arguments.model';
import { MediaInfo } from '../models/report.model';

function buildPattern(media: MediaInfo): { [key: string]: string } {
  const date: string = media.date ?? '';
  const year: string = date.substring(0, 4) || '??';
  const month: string = date.substring(5, 7) || '??';
  const day: string = date.substring(8, 10) || '??';
  const hour: string = date.substring(12, 14) || '??';
  const minute: string = date.substring(15, 16) || '??';
  const second: string = date.substring(17, 19) || '??';
  return {
    file_name: basename(media.path),
    date,
    year,
    month,
    day,
    hour,
    minute,
    second,
    hash: media.hash ?? '',
  };
}

function takeWhile(array: string[], predicate: (value: string) => boolean): string[] {
  const result: string[] = [];
  for (const value of array) {
    if (predicate(value)) result.push(value);
    else break;
  }
  return result;
}

export class PatternService {

  public constructor(
    private readonly argv: SortArgument,
  ) { }

  public parse(media: MediaInfo, toParse: string = this.argv.pattern): string {
    const pattern: { [key: string]: string } = buildPattern(media);
    const keys: string[] = Object.keys(pattern);

    const paths: string[] = toParse.replace(sep, '{separator}').split('{separator}');
    const parsed: string[] = paths.map(path => {
      for (const key of keys) {
        path = path.replaceAll(`{${key}}`, pattern[key]);
      }
      return path;
    });
    return this.normalizePath(parsed, pattern.file_name);
  }

  private normalizePath(parsed: string[], fileName: string): string {
    console.log(parsed);
    const valid: string[] = takeWhile(parsed, (section) => !section.includes('??'));
    const lastItem: string = valid.length > 0
      ? valid[valid.length - 1]
      : '';
    if (lastItem !== fileName) valid.push(fileName);
    return join(...valid);
  }

}