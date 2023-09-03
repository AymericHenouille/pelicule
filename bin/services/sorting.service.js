"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortingService = void 0;
const chalk_1 = __importDefault(require("chalk"));
const promises_1 = require("fs/promises");
const path_1 = require("path");
const pattern_service_1 = require("./pattern.service");
/**
 * Transform a relative path to an absolute path.
 * @param folder The folder where the file is located.
 * @param path The relative path of the file.
 * @returns The absolute path of the file.
 */
function buildPath(folder, path) {
    return (0, path_1.join)(folder, path);
}
function buildSortUpdate(path, index) {
    return {
        status: 'progress',
        progress: {
            stepName: 'Sorting',
            target: chalk_1.default.blue((0, path_1.basename)(path)),
            processProgress: index + 1,
        },
        result: [],
    };
}
function buildDone(stepName, result, total) {
    return {
        status: 'done',
        progress: {
            stepName,
            target: chalk_1.default.green('done'),
            processProgress: total,
        },
        result,
    };
}
class SortingService {
    argv;
    constructor(argv) {
        this.argv = argv;
    }
    async sorting(files, chunk, update) {
        const folder = this.argv.folder;
        for (let index = 0; index < chunk.length; ++index) {
            const media = chunk[index];
            const patternService = new pattern_service_1.PatternService(this.argv);
            const targetPath = buildPath(folder, media.path);
            const destPath = buildPath(folder, patternService.parse(media));
            try {
                await this.moveFile(targetPath, destPath);
                media.path = destPath.replace(folder, '.');
            }
            catch (error) {
                console.error(error);
            }
            update(buildSortUpdate(media.path, index));
        }
        update(buildDone('Sorting', chunk, chunk.length));
    }
    /**
     * Move a file from a source to a target.
     * If the target directory does not exist, it will be created.
     * If the copy succeed, the source file will be deleted.
     * If the copy failed, the source file will not be deleted.
     *
     * If the target file already exist, it will be deleted before the copy.
     *
     * @param source The source file.
     * @param target The target file.
     */
    async moveFile(source, target) {
        const { dir } = (0, path_1.parse)(target);
        await (0, promises_1.mkdir)(dir, { recursive: true });
        await (0, promises_1.rename)(source, target);
    }
}
exports.SortingService = SortingService;
