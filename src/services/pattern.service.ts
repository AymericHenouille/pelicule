import { basename, join, sep } from 'path';
import { SortArgument } from '../models/arguments.model';
import { MediaInfo } from '../models/report.model';

function buildPattern(media: MediaInfo): { [key: string]: string } {
  const year: string = media.date?.year ?? '??';
  const month: string = media.date?.month ?? '??';
  const day: string = media.date?.day ?? '??';
  return {
    file_name: basename(media.path),
    year,
    month,
    day,
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