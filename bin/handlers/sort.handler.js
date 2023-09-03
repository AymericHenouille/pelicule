"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortCommandHandler = void 0;
const path_1 = require("path");
const file_explorer_service_1 = require("../services/file-explorer.service");
const worker_service_1 = require("../services/worker.service");
const log_util_1 = require("../utils/log.util");
function sortCommandHandler() {
    return async (argv) => {
        const startTick = performance.now();
        const pscFile = argv.output ?? (0, path_1.join)(argv.folder, '.psc.json');
        const fileExplorer = new file_explorer_service_1.FileExplorer(argv.folder, argv);
        const workerService = new worker_service_1.WorkerService(argv);
        const analyse = await fileExplorer.readJson(pscFile, []);
        try {
            const sorted = await workerService.runJobs(analyse, 'sorting');
            await fileExplorer.removeEmptyFolders();
            await fileExplorer.writeJson(pscFile, sorted);
            (0, log_util_1.log)(argv, `Sorted ${sorted.length} files in ${(0, log_util_1.formatTimeMesage)(performance.now() - startTick)}`);
        }
        catch (error) {
            console.error(error);
        }
    };
}
exports.sortCommandHandler = sortCommandHandler;
