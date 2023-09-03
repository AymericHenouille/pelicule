"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCommand = void 0;
const analyse_command_1 = require("./analyse.command");
const sort_command_1 = require("./sort.command");
/**
 * The list of commands available for the CLI.
 */
const COMMANDS = [
    analyse_command_1.analyseCommand,
    sort_command_1.sortCommand,
];
/**
 * Builds the command for the CLI.
 * @param yargs The yargs instance to use.
 * @returns The yargs instance with the command.
 */
function buildCommand(yargs) {
    return yargs
        .command(COMMANDS)
        .demandCommand()
        .help();
}
exports.buildCommand = buildCommand;
