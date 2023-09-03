#!/usr/bin/env node
import { hideBin } from 'yargs/helpers';
import { main } from './main';

/**
 * Entry point for the CLI.
 */
const args: string[] = hideBin(process.argv);
main(args).catch(error => console.error(error));