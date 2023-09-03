"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileExplorer = exports.FILE_TO_IGNORE = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
/**
 * The list of files to ignore.
 *
 */
exports.FILE_TO_IGNORE = [
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
class FileExplorer {
    path;
    options;
    /**
     * Creates a new FileExplorer instance.
     * @param path The path to explore.
     * @param options The options to use.
     */
    constructor(path, options) {
        this.path = path;
        this.options = options;
    }
    /**
     * Returns the list of files in the folder.
     * @param originPath The path to explore.
     * @returns The list of files in the folder.
     */
    async getFiles(originPath = this.path) {
        const recurcive = this.options.recurcive;
        const fileStats = await (0, promises_1.stat)(originPath);
        const isDirectory = fileStats.isDirectory();
        if (!isDirectory)
            return [originPath];
        else if (recurcive) {
            const dirents = await (0, promises_1.readdir)(originPath, { withFileTypes: true });
            const paths = await Promise.all(dirents.map(dirent => {
                const targetPath = (0, path_1.join)(originPath, dirent.name);
                return dirent.isDirectory()
                    ? this.getFiles(targetPath)
                    : Promise.resolve(targetPath);
            }));
            return paths.flat()
                .filter(path => !exports.FILE_TO_IGNORE.find(file => path.endsWith(file)));
        }
        return [];
    }
    /**
     * Take a path and remove all empty folders recursively.
     * @param path The path to clean.
     * @returns A promise that resolves when the cleaning is done.
     */
    async removeEmptyFolders(path = this.path) {
        const files = await (0, promises_1.readdir)(path, { withFileTypes: true });
        for (const file of files) {
            if (file.isDirectory()) {
                const filePath = (0, path_1.join)(path, file.name);
                await this.removeEmptyFolders(filePath);
                const files = (await (0, promises_1.readdir)(filePath))
                    .filter((file) => !exports.FILE_TO_IGNORE.find((ignore) => file.endsWith(ignore)));
                if (files.length === 0)
                    await (0, promises_1.rm)(filePath, { recursive: true });
            }
        }
    }
    /**
     * Write the report to a json file.
     * @param output The path to the output file.
     * @param mediaDateInfos The report to write.
     * @returns A promise that resolves when the file is written.
     */
    writeJson(output, mediaDateInfos) {
        const content = JSON.stringify(mediaDateInfos, null, 2);
        return (0, promises_1.writeFile)(output, content);
    }
    /**
     * Read a json file.
     * @param path The path to the json file.
     * @return The content of the json file.
     */
    async readJson(path, defaultValue) {
        try {
            await (0, promises_1.access)(path, promises_1.constants.R_OK);
            const content = await (0, promises_1.readFile)(path, 'utf8');
            return JSON.parse(content);
        }
        catch (error) {
            return defaultValue;
        }
    }
}
exports.FileExplorer = FileExplorer;
