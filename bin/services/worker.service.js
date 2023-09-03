"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerService = void 0;
const chalk_1 = __importDefault(require("chalk"));
const cli_progress_1 = require("cli-progress");
const path_1 = require("path");
const stream_1 = require("stream");
const worker_threads_1 = require("worker_threads");
const dispatcher_service_1 = require("./dispatcher.service");
if (!worker_threads_1.isMainThread) {
    const { items, chunk, job, argv } = worker_threads_1.workerData;
    const dispatcherService = new dispatcher_service_1.DispatcherService(argv);
    dispatcherService.dispatch(job, items, chunk, (status) => worker_threads_1.parentPort?.postMessage(status));
}
class WorkerService {
    argv;
    static URL = (0, path_1.join)(__dirname, './worker.service.js');
    constructor(argv) {
        this.argv = argv;
    }
    /**
     * Run a chunk of jobs.
     * @param jobs The jobs to run.
     * @returns The results of the jobs.
     */
    async runJobs(items, job) {
        const chunks = this.buildChunks(items, this.argv.workers);
        const multiBar = new cli_progress_1.MultiBar({
            format: '{stepName} [{bar}] {value}/{total} | {target}',
            hideCursor: true,
            stopOnComplete: true,
            emptyOnZero: true,
            stream: this.argv.verbose ? process.stdout : new stream_1.PassThrough(),
            formatValue: (value, _, type) => {
                if (type === 'total')
                    return chalk_1.default.bold(value.toString());
                if (type === 'value') {
                    const length = value.toString().length;
                    const targetLength = chunks[0].length.toString().length;
                    const padding = ' '.repeat(targetLength - length);
                    const formatedValue = padding + value;
                    return chalk_1.default.gray(formatedValue);
                }
                return value.toString();
            },
        }, cli_progress_1.Presets.shades_grey);
        if (this.argv.verbose)
            console.log(`Running ${chalk_1.default.magenta(chunks.length)} chunks of ${chalk_1.default.bold(job)} jobs...`);
        const results = await Promise.allSettled(chunks.map((chunk) => this.runChunk(items, chunk, job, multiBar)));
        multiBar.stop();
        if (this.argv.verbose)
            console.clear();
        return results
            .filter((result) => result.status === 'fulfilled')
            .map((result) => result.value)
            .flat();
    }
    runChunk(items, chunk, job, multiBar) {
        const bar = multiBar.create(chunk.length, 0);
        bar.update(0, { stepName: job, target: chalk_1.default.yellow('starting') });
        this.readChunkMessage({
            status: 'progress',
            progress: {
                processProgress: 0,
                stepName: job,
                target: chalk_1.default.yellow('starting')
            },
            result: [],
        }, bar, () => { });
        const workerData = { items, chunk, job, argv: this.argv };
        const worker = new worker_threads_1.Worker(WorkerService.URL, { workerData });
        return new Promise((resolve, reject) => worker
            .on('message', (message) => this.readChunkMessage(message, bar, resolve))
            .on('error', (error) => { bar.stop(); reject(error); })
            .on('exit', (code) => {
            if (code !== 0) {
                bar.stop();
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        }));
    }
    readChunkMessage(message, bar, resolve) {
        const progress = message.progress;
        bar.update(progress.processProgress, {
            stepName: chalk_1.default.bold(progress.stepName),
            target: progress.target
        });
        if (message.status === 'done')
            resolve(message.result);
    }
    /**
     * Split an array into chunks.
     * @param array The array to split.
     * @param chunksNumber The number of chunks.
     * @returns The array of chunks.
     */
    buildChunks(array, chunksNumber) {
        const finalChunksNumber = Math.min(array.length, chunksNumber);
        const chunkSize = Math.ceil(array.length / finalChunksNumber);
        const mapFn = (_, index) => array.slice(index * chunkSize, (index + 1) * chunkSize);
        return Array.from({ length: chunksNumber }, mapFn);
    }
}
exports.WorkerService = WorkerService;
