import { FileHandle, open } from 'fs/promises';
import Jimp, { create } from 'jimp';
import { MediaInfo } from '../../models/report.model';
import { Transformer } from '../../models/transform.model';

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
export class HashTransformer implements Transformer<Partial<MediaInfo>, Partial<MediaInfo>> {

  public readonly transformerName: string = 'Hashing';

  public async transform(item: Partial<MediaInfo>): Promise<Partial<MediaInfo>> {
    const { path, hash, tags } = item;
    if (hash) return item;
    const updatedTags: string[] = tags ?? [];
    const hashedFile: string = await this.hashFile(path ?? '', updatedTags);
    return Object.assign(item, { 
      hash: hashedFile,
      tags: updatedTags
    });
  }

  private async hashFile(path: string, tags: string[]): Promise<string> {
    if (!jimpCanHash(path)) return '';
    let fileHandle: FileHandle | null = null;
    let hash: string = '';
    try {
      fileHandle = await open(path, 'r');
      const buffer: Buffer = await fileHandle.readFile();
      const image: Jimp = await create(buffer);
      hash = image.hash();
    } 
    catch (error) { tags.push('hash-error'); } 
    finally { await fileHandle?.close(); }
    return hash;
  }

}