"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const yargs_1 = __importDefault(require("yargs/yargs"));
const commands_1 = require("./commands");
/**
 * Main app function that will be called from the CLI.
 * @param args The arguments passed to the CLI.
 * @returns A promise that will be resolved when the app is done.
 */
async function main(args) {
    const commands = (0, commands_1.buildCommand)((0, yargs_1.default)());
    await commands.parse(args);
}
exports.main = main;
