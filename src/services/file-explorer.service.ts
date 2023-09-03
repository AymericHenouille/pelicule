import { Dirent, Stats } from 'fs';
import { access, constants, readFile, readdir, rm, stat, writeFile } from 'fs/promises';
import { join } from 'path';
import { Argument } from '../models/arguments.model';
import { MediaInfo } from '../models/report.model';

/**
 * The list of files to ignore.
 * 
 */
export const FILE_TO_IGNORE: string[] = [
  '.json', 
  '.DS_Store',
  'Desktop.ini',
  'Thumbs.db',
  '.xmp'
];

/**
 * FileExplorer is a service that allows to explore a folder and list all files in it.
 * It can be used in a recursive way to explore subfolders.
 */
export class FileExplorer {

  /**
   * Creates a new FileExplorer instance.
   * @param path The path to explore.
   * @param options The options to use.
   */
  public constructor(
    private readonly path: string,
    private readonly options: Argument<unknown>,
  ) { }

  /**
   * Returns the list of files in the folder.
   * @param originPath The path to explore.
   * @returns The list of files in the folder.
   */
  public async getFiles(originPath: string = this.path): Promise<string[]> {
    const recurcive: boolean = this.options.recurcive;
    const fileStats: Stats = await stat(originPath);
    const isDirectory: boolean = fileStats.isDirectory();
    if (!isDirectory) return [originPath];
    else if (recurcive) {
      const dirents: Dirent[] = await readdir(originPath, { withFileTypes: true });
      const paths: (string | string[])[] = await Promise.all(dirents.map(dirent => {
        const targetPath: string = join(originPath, dirent.name);
        return dirent.isDirectory() 
          ? this.getFiles(targetPath) 
          : Promise.resolve(targetPath);
      }));
      return paths.flat()
        .filter(path => !FILE_TO_IGNORE.find(file => path.endsWith(file)));
    }
    return [];
  }

  /**
   * Take a path and remove all empty folders recursively.
   * @param path The path to clean.
   * @returns A promise that resolves when the cleaning is done.
   */
  public async removeEmptyFolders(path: string = this.path): Promise<void> {
    const files: Dirent[] = await readdir(path, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        const filePath: string = join(path, file.name);
        await this.removeEmptyFolders(filePath);
        const files: string[] = (await readdir(filePath))
          .filter((file) => !FILE_TO_IGNORE.find((ignore) => file.endsWith(ignore)));
        if (files.length === 0) await rm(filePath, { recursive: true });
      }
    }
  }

  /**
   * Write the report to a json file.
   * @param output The path to the output file.
   * @param mediaDateInfos The report to write.
   * @returns A promise that resolves when the file is written.
   */
  public writeJson(output: string, mediaDateInfos: MediaInfo[]): Promise<void> {
    const content: string = JSON.stringify(mediaDateInfos, null, 2)
    return writeFile(output, content);
  }

  /**
   * Read a json file.
   * @param path The path to the json file.
   * @return The content of the json file.
   */
  public async readJson<T>(path: string, defaultValue: T): Promise<T> {
    try {
      await access(path, constants.R_OK);
      const content: string = await readFile(path, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return defaultValue;
    }
  }

}