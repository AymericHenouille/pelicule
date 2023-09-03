"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultOptionBuilder = void 0;
const os_1 = require("os");
/**
 * Build the default options for all commands.
 *
 * @param yargs The yargs instance.
 * @returns The yargs instance with the default optionse
 */
function defaultOptionBuilder(yargs) {
    return yargs.option('recurcive', {
        alias: 'r',
        describe: 'Analyse the folder recursively',
        type: 'boolean',
        default: false,
    })
        .option('verbose', {
        alias: 'v',
        describe: 'Verbose output',
        type: 'boolean',
        default: false,
    })
        .option('workers', {
        alias: 'w',
        describe: 'Number of workers',
        type: 'number',
        default: (0, os_1.cpus)().length,
    });
}
exports.defaultOptionBuilder = defaultOptionBuilder;
