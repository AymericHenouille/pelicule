import Jimp, { create } from 'jimp';
import { MediaInfo } from '../models/report.model';
import { Transformer } from '../models/transform.model';

/**
 * Check if jimp can hash the file.
 * @param path The path to check.
 * @returns True if jimp can hash the file, false otherwise.
 */
function jimpCanHash(path: string): boolean {
  const parsedPath: string = path.toLowerCase();
  return parsedPath.endsWith('.png') 
    || parsedPath.endsWith('.jpg') 
    || parsedPath.endsWith('.jpeg') 
    || parsedPath.endsWith('.bmp') 
    || parsedPath.endsWith('.tiff') 
    || parsedPath.endsWith('.gif');
}

/**
 * HashTransformer is a transformer that allows to hash a list of files.
 * @template T The type of the argument.
 */
export class HashTransformer<T> implements Transformer<Partial<MediaInfo>, Partial<MediaInfo>> {

  public readonly transformerName: string = 'Hashing';

  public async transform(item: Partial<MediaInfo>): Promise<Partial<MediaInfo>> {
    const { path } = item;
    const hash: string = await this.hashFile(path ?? '');
    return { ...item, hash };
  }

  private async hashFile(path: string): Promise<string> {
    if (!jimpCanHash(path)) return '';
    const image: Jimp = await create(path);
    return image.hash();
  }

}