"use strict";
// import { MultiBar, Presets, SingleBar } from 'cli-progress';
// import os from 'os';
// import { join } from 'path';
// import { Worker } from 'worker_threads';
// import { AnalyseWorkerData } from '../../models/handler.model';
// import { AnalyseReport, MediaInfo } from '../../models/report.model';
// import { FileExplorer } from '../../services/file-explorer.service';
// import { AnalyseCommandArguments } from '../analyse.command';
// function buildFileChunks(files: string[], chunksNumber: number, chunkSize: number): string[][] {
//   const chunks: string[][] = [];
//   for (let i: number = 0; i < chunksNumber; i++) {
//     chunks.push(files.slice(i * chunkSize, (i + 1) * chunkSize));
//   }
//   return chunks;
// }
// function buildMultiBar(): MultiBar {
//   return new MultiBar({
//     clearOnComplete: false,
//     hideCursor: true,
//     format: '{name} | {bar} | {value}/{total} | {filename} progress: {step}%',
//   }, Presets.shades_grey);
// }
// function analyseChunk(chunk: string[], allFiles: string[], argv: AnalyseCommandArguments, bar: SingleBar): Promise<MediaInfo[]> {
//   const url: string = join(__dirname, '../../workers/analyse.worker.js');
//   const worker: Worker = new Worker(url, { 
//     workerData: { chunk, allFiles, argv },
//   });
//   return new Promise((resolve, reject) => worker
//     .on('message', (message: AnalyseWorkerData) => {
//       bar.update(message.step, {
//         filename: message.currentFile,
//         step: message.stepProgress 
//       });
//       if (message.mediaInfo.length > 0) resolve(message.mediaInfo);
//     })
//     .on('error', (error: ErrorEvent) => reject(error))
//     .on('exit', (code: number) => {
//       if (code !== 0) {
//         reject(new Error(`Worker stopped with exit code ${code}`));
//       }
//     })
//   );
// }
// async function createAnalyseReport(files: string[], argv: AnalyseCommandArguments): Promise<AnalyseReport> {
//   const cpuCount: number = os.cpus().length;
//   const chunkSize: number = Math.ceil(files.length / cpuCount);
//   console.log(`Splitting in ${cpuCount} chunks of ${chunkSize} files`);
//   const chunks: string[][] = buildFileChunks(files, cpuCount, chunkSize);
//   const multiBar: MultiBar = buildMultiBar();
//   const infos: MediaInfo[] = (await Promise.all(chunks.map((chunk, index) => {
//     const bar: SingleBar = multiBar.create(chunk.length, 0, { 
//       name: `Chunk ${index + 1}/${cpuCount}`,
//       filename: '.' 
//     });
//     return analyseChunk(chunk, files, argv, bar);
//   }))).flat();
//   multiBar.stop();
//   return {
//     reportDate: new Date(),
//     folder: argv.folder,
//     size: infos.reduce((total, info) => total + info.size, 0),
//     photos: infos
//   }
// }
// export async function analyseCommandHandler(argv: AnalyseCommandArguments): Promise<void> {
//   const startTick: number = performance.now();
//   const fileExplorer: FileExplorer = new FileExplorer(argv.folder, argv);
//   const files: string[] = await fileExplorer.getFiles();
//   const report: AnalyseReport = await createAnalyseReport(files, argv);
//   console.log(`Report:`, report.size / 1e9, report.photos.length);
//   const endTick: number = performance.now();
//   console.log(`Analyse ${files.length} files in ${(endTick - startTick) / 1000}s`);
// }
