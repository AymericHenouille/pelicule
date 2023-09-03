"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyseCommand = void 0;
const analyse_handler_1 = require("../handlers/analyse.handler");
const default_options_1 = require("./default.options");
/**
 * Analyse command.
 */
exports.analyseCommand = {
    command: 'analyse [folder]',
    aliases: ['a'],
    describe: 'Analyse a folder content',
    builder: (yargs) => (0, default_options_1.defaultOptionBuilder)(yargs)
        .positional('folder', {
        describe: 'The folder to analyse',
        type: 'string',
        default: '.',
    })
        .option('output', {
        alias: 'o',
        describe: 'Output the result to a file',
        type: 'string',
    })
        .option('distance', {
        alias: 'd',
        describe: 'The distance to use for the comparison',
        type: 'number',
        default: 0.15,
    })
        .option('cache', {
        alias: 'c',
        describe: 'Use the cache to speed up the process',
        type: 'boolean',
        default: true,
    }),
    handler: (0, analyse_handler_1.analyseCommandHandler)(),
};
