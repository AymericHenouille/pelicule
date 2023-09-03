import { Argv } from 'yargs';
import yargs from 'yargs/yargs';
import { buildCommand } from './commands';

/**
 * Main app function that will be called from the CLI.
 * @param args The arguments passed to the CLI.
 * @returns A promise that will be resolved when the app is done.
 */
export async function main(args: string[]): Promise<void> {
  const commands: Argv<{}> = buildCommand(yargs());
  await commands.parse(args);
}