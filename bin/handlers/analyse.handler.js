"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyseCommandHandler = void 0;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = require("path");
const file_explorer_service_1 = require("../services/file-explorer.service");
const worker_service_1 = require("../services/worker.service");
const log_util_1 = require("../utils/log.util");
/**
 * Analyse command handler.
 * @returns The command handler.
 */
function analyseCommandHandler() {
    return async (argv) => {
        const startTick = performance.now();
        const pscFile = argv.output ?? (0, path_1.join)(argv.folder, '.psc.json');
        const fileExplorer = new file_explorer_service_1.FileExplorer(argv.folder, argv);
        const workerService = new worker_service_1.WorkerService(argv);
        try {
            const { files, oldAnalysis } = await findFilesToAnalyse(fileExplorer, pscFile, argv);
            (0, log_util_1.log)(argv, `Found ${files.length} files in ${(0, log_util_1.formatTimeMesage)(performance.now() - startTick)}`);
            const hashedMedia = await workerService.runJobs(files, 'hashing');
            (0, log_util_1.log)(argv, `Hashed ${hashedMedia.length} files in ${(0, log_util_1.formatTimeMesage)(performance.now() - startTick)}`);
            const mediaInfos = await workerService.runJobs(hashedMedia, 'compare');
            (0, log_util_1.log)(argv, `Compared ${mediaInfos.length} files in ${(0, log_util_1.formatTimeMesage)(performance.now() - startTick)}`);
            const mediaDateInfos = await workerService.runJobs(mediaInfos, 'dating');
            (0, log_util_1.log)(argv, `Dated ${mediaDateInfos.length} files in ${(0, log_util_1.formatTimeMesage)(performance.now() - startTick)}`);
            const fullMediaDateInfos = [...mediaDateInfos, ...oldAnalysis];
            await fileExplorer.writeJson(pscFile, fullMediaDateInfos);
            if (argv.verbose) {
                const report = formatReport(mediaDateInfos, oldAnalysis, startTick, pscFile);
                (0, log_util_1.log)(argv, report);
            }
        }
        catch (error) {
            console.error(error);
        }
    };
}
exports.analyseCommandHandler = analyseCommandHandler;
/**
 * Find the files to analyse.
 * @param fileExplorer The file explorer to use.
 * @param pscFile The path to the psc file.
 */
async function findFilesToAnalyse(fileExplorer, pscFile, { folder, cache }) {
    const files = await fileExplorer.getFiles();
    if (!cache)
        return { files, oldAnalysis: [] };
    const oldAnalysis = await fileExplorer.readJson(pscFile, []);
    return {
        files: files.filter((file) => {
            const targetFile = file.replace(folder, '.');
            return !oldAnalysis.some((mediaInfo) => mediaInfo.path === targetFile);
        }),
        oldAnalysis,
    };
}
function formatReport(mediaInfos, oldAnalysis, startTick, pscFile) {
    const time = (0, log_util_1.formatTimeMesage)(performance.now() - startTick);
    const savedFile = pscFile;
    return `
  Report saved to ${chalk_1.default.gray(savedFile)}.

  ${chalk_1.default.magenta(mediaInfos.length)} files analysed in ${chalk_1.default.green(time)}.

  ${chalk_1.default.magenta(mediaInfos.filter((mediaInfo) => mediaInfo.date).length)} files dated.
  ${chalk_1.default.magenta(mediaInfos.filter((mediaInfo) => mediaInfo.copy.length > 0).length)} files with copy.

  The report contains ${chalk_1.default.magenta(oldAnalysis.length)} files from previous analysis.
  Now contains ${chalk_1.default.magenta(mediaInfos.length + oldAnalysis.length)} files.
  `;
}
