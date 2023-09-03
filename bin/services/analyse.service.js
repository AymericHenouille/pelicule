"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyseService = void 0;
const chalk_1 = __importDefault(require("chalk"));
const exifr_1 = require("exifr");
const promises_1 = require("fs/promises");
const jimp_1 = require("jimp");
const path_1 = require("path");
function buildCompareUpdate(path, index) {
    return {
        status: 'progress',
        progress: {
            stepName: 'Comparing',
            target: chalk_1.default.blue((0, path_1.basename)(path)),
            processProgress: index + 1,
        },
        result: [],
    };
}
function buildHashUpdate(path, index) {
    return {
        status: 'progress',
        progress: {
            stepName: 'Hashing',
            target: chalk_1.default.blue((0, path_1.basename)(path)),
            processProgress: index + 1,
        },
        result: [],
    };
}
function buildDatingUpdate(path, index) {
    return {
        status: 'progress',
        progress: {
            stepName: 'Dating',
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
class AnalyseService {
    argv;
    constructor(argv) {
        this.argv = argv;
    }
    async hashing(items, chunk, update) {
        const result = [];
        for (let index = 0; index < chunk.length; ++index) {
            const path = chunk[index];
            const hash = await this.hash(path);
            result.push({
                path,
                hash,
                copy: [],
                tags: [],
            });
            update(buildHashUpdate(path, index));
        }
        update(buildDone('Hashing', result, chunk.length));
    }
    async compare(items, chunk, update) {
        const targetRootDir = this.argv.folder;
        const result = [];
        for (let index = 0; index < chunk.length; ++index) {
            const media = chunk[index];
            result.push({
                path: media.path,
                hash: media.hash,
                copy: items.filter((item) => {
                    if (item.path === media.path)
                        return false;
                    if (item.hash === null || media.hash === null)
                        return false;
                    const distance = (0, jimp_1.compareHashes)(item.hash, media.hash);
                    return distance <= this.argv.distance;
                }).map((item) => item.path.replace(targetRootDir, '.')),
                tags: [],
            });
            update(buildCompareUpdate(media.path, index));
        }
        update(buildDone('Comparing', result, chunk.length));
    }
    async dating(items, chunk, update) {
        const targetRootDir = this.argv.folder;
        const result = [];
        for (let index = 0; index < chunk.length; ++index) {
            const { path, hash, copy, tags } = chunk[index];
            result.push({
                path: path.replace(targetRootDir, '.'),
                hash,
                copy,
                tags,
                date: await this.findDate(path),
            });
            update(buildDatingUpdate(path, index));
        }
        update(buildDone('Dating', result, chunk.length));
    }
    async findDate(path) {
        try {
            const buffer = await (0, promises_1.readFile)(path);
            const exif = await (0, exifr_1.parse)(buffer);
            const date = exif?.DateTimeOriginal || exif?.CreateDate || exif?.ModifyDate;
            return date?.toISOString().split('T')[0] || this.getCreationDate(path);
        }
        catch (error) {
            return this.getCreationDate(path);
        }
    }
    async getCreationDate(path) {
        const stats = await (0, promises_1.stat)(path);
        return stats.mtime.toISOString().split('T')[0];
    }
    async hash(path) {
        if (!this.canHash(path))
            return null;
        try {
            const image = await (0, jimp_1.create)(path);
            return image.hash();
        }
        catch (error) {
            return null;
        }
    }
    canHash(path) {
        const parsedPath = path.toLowerCase();
        return parsedPath.endsWith('.png')
            || parsedPath.endsWith('.jpg')
            || parsedPath.endsWith('.jpeg')
            || parsedPath.endsWith('.bmp')
            || parsedPath.endsWith('.tiff')
            || parsedPath.endsWith('.gif');
    }
}
exports.AnalyseService = AnalyseService;
