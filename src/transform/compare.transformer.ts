import { compareHashes } from 'jimp';
import { AnalyseArgument } from '../models/arguments.model';
import { MediaInfo } from '../models/report.model';
import { Transformer } from '../models/transform.model';

/**
 * CompareTransformer is a transformer that allows to compare a list of files.
 */
export class CompareTransformer implements Transformer<Partial<MediaInfo>, Partial<MediaInfo>> {
  
  public readonly transformerName: string = 'Comparing';

  public constructor(
    private readonly argv: AnalyseArgument,
    private readonly files: MediaInfo[],
  ) { }

  public async transform(item: Partial<MediaInfo>): Promise<Partial<MediaInfo>> {
    const copy: string[] = this.findCopy(item.hash ?? '');
    return { ...item, copy };
  }

  private findCopy(hash: string): string[] {
    return this.files.filter((file: MediaInfo) => file.hash !== undefined && file.hash !== null)
      .filter((file: MediaInfo) => file.hash !== hash)
      .filter((file: MediaInfo) => compareHashes(file?.hash ?? '', hash) <= this.argv.distance)
      .map((file: MediaInfo) => file.path);
  }

}