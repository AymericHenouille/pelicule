"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortCommand = void 0;
const sort_handler_1 = require("../handlers/sort.handler");
const default_options_1 = require("./default.options");
exports.sortCommand = {
    command: 'sort [folder]',
    aliases: ['s'],
    describe: 'Sort an analysed folder content',
    builder: (yargs) => (0, default_options_1.defaultOptionBuilder)(yargs)
        .positional('folder', {
        describe: 'The folder to sort',
        type: 'string',
        default: '.',
    })
        .option('output', {
        alias: 'o',
        describe: 'Output the result to a file',
        type: 'string',
    })
        .option('pattern', {
        alias: 'p',
        describe: 'Pattern to use to sort the files',
        type: 'string',
        default: '{year}{separator}{year}-{month}{separator}{year}-{month}-{day}{separator}{file_name}',
    }),
    handler: (0, sort_handler_1.sortCommandHandler)(),
};
