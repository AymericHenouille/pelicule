import { Argv, CommandModule } from 'yargs';
import { analyseCommand } from './analyse.command';
import { sortCommand } from './sort.command';

/**
 * The list of commands available for the CLI.
 */
const COMMANDS: CommandModule<any, any>[] = [
  analyseCommand,
  sortCommand,
];

/**
 * Builds the command for the CLI.
 * @param yargs The yargs instance to use.
 * @returns The yargs instance with the command.
 */
export function buildCommand<T>(yargs: Argv<T>): Argv<T> {
  return yargs
    .command(COMMANDS)
    .demandCommand()
    .help();
}