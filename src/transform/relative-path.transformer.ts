import { ParsedPath, parse } from 'path';
import { MediaInfo } from '../models/report.model';
import { Transformer } from '../models/transform.model';

export class RelativePathTransformer implements Transformer<Partial<MediaInfo>, Partial<MediaInfo>> {

  public readonly transformerName: string = 'Ajusting path';

  public constructor(
    private readonly relativeTo: string,
  ) { }

  public transform(item: Partial<MediaInfo>): Promise<Partial<MediaInfo>> {
    const path: string = item.path ?? '';
    const parsedPath: ParsedPath = parse(path);
    return Promise.resolve({
      ...item,
      path: parsedPath.root === '' ? `${this.relativeTo}/${path}` : path,
    });
  }

}