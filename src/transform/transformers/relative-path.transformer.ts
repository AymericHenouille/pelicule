import { relative } from 'path';
import { MediaInfo } from '../../models/report.model';
import { Transformer } from '../../models/transform.model';

/**
 * This transformer will transform the path of the media to an relative path of a dir.
 */
export class RelativePathTransformer implements Transformer<Partial<MediaInfo>, Partial<MediaInfo>> {
  /**
   * The name of the transformer.
   *
   * @type {string}
   * @memberof AbsoluteTransformer
   */
  public readonly transformerName: string = 'Relative';

  public constructor(
    private readonly folder: string,
  ) { }

  /**
   * Transform the path of the media to an absolute path.
   * @param item The media to transform.
   * @returns The transformed media.
   */
  public transform(item: Partial<MediaInfo>): Promise<Partial<MediaInfo>> {
    const path: string = relative(this.folder, item.path ?? '.');
    return Promise.resolve(Object.assign(item, { path }));
  }

}