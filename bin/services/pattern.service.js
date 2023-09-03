"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternService = void 0;
const path_1 = require("path");
function buildPattern(media) {
    const date = media.date ?? '';
    const year = date.substring(0, 4) || '??';
    const month = date.substring(5, 7) || '??';
    const day = date.substring(8, 10) || '??';
    const hour = date.substring(12, 14) || '??';
    const minute = date.substring(15, 16) || '??';
    const second = date.substring(17, 19) || '??';
    return {
        file_name: (0, path_1.basename)(media.path),
        date,
        year,
        month,
        day,
        hour,
        minute,
        second,
        hash: media.hash ?? '',
    };
}
function takeWhile(array, predicate) {
    const result = [];
    for (const value of array) {
        if (predicate(value))
            result.push(value);
        else
            break;
    }
    return result;
}
class PatternService {
    argv;
    constructor(argv) {
        this.argv = argv;
    }
    parse(media, toParse = this.argv.pattern) {
        const pattern = buildPattern(media);
        const keys = Object.keys(pattern);
        const paths = toParse.replace(path_1.sep, '{separator}').split('{separator}');
        const parsed = paths.map(path => {
            for (const key of keys) {
                path = path.replaceAll(`{${key}}`, pattern[key]);
            }
            return path;
        });
        return this.normalizePath(parsed, pattern.file_name);
    }
    normalizePath(parsed, fileName) {
        console.log(parsed);
        const valid = takeWhile(parsed, (section) => !section.includes('??'));
        const lastItem = valid.length > 0
            ? valid[valid.length - 1]
            : '';
        if (lastItem !== fileName)
            valid.push(fileName);
        return (0, path_1.join)(...valid);
    }
}
exports.PatternService = PatternService;
