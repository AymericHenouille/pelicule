import { compareHashes } from 'jimp';
import { AnalyseArgument } from '../../models/arguments.model';
import { MediaInfo } from '../../models/report.model';
import { Transformer } from '../../models/transform.model';
import { RelativePathTransformer } from './relative-path.transformer';

/**
 * CompareTransformer is a transformer that allows to compare a list of files.
 * It will compare the hash of each file and will return the list of files that are similar.
 */
export class CompareTransformer implements Transformer<Partial<MediaInfo>, Partial<MediaInfo>> {
  
  /**
   * The name of the transformer.
   *
   * @type {string}
   * @memberof CompareTransformer
   */
  public readonly transformerName: string = 'Comparing';

  /**
   * Creates an instance of CompareTransformer.
   * @param argv The arguments of the command.
   * @param files The list of files to compare.
   */
  public constructor(
    private readonly argv: AnalyseArgument,
    private readonly files: MediaInfo[],
  ) { }

  /**
   * Compare the hash of the item with the list of files.
   * @param item The item to transform.
   * @returns The item with the list of similar files.
   */
  public async transform(item: Partial<MediaInfo>): Promise<Partial<MediaInfo>> {
    const mediaInfos: Partial<MediaInfo>[] = await Promise.all(this.findCopy(item.hash ?? ''));
    const copy: string[] = mediaInfos.map((mediaInfo: Partial<MediaInfo>) => mediaInfo.path ?? '');
    return { ...item, copy };
  }

  /**
   * Find the list of files that are similar to the hash.
   * @param hash The hash to compare.
   * @returns The list of similar files.
   */
  private findCopy(hash: string): Promise<Partial<MediaInfo>>[] {
    const relativeTransformer: RelativePathTransformer = new RelativePathTransformer(this.argv.folder);
    return this.files.filter((file: MediaInfo) => file.hash !== undefined && file.hash !== null)
      .filter((file: MediaInfo) => file.hash !== hash)
      .filter((file: MediaInfo) => compareHashes(file?.hash ?? '', hash) <= this.argv.distance)
      .map((file: MediaInfo) => relativeTransformer.transform(file));
  }

}