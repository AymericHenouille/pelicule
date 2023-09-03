#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("yargs/helpers");
const main_1 = require("./main");
/**
 * Entry point for the CLI.
 */
const args = (0, helpers_1.hideBin)(process.argv);
(0, main_1.main)(args).catch(error => console.error(error));
