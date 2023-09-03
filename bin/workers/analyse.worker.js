"use strict";
// import { Stats } from 'fs';
// import { stat } from 'fs/promises';
// import Jimp, { create, distance } from 'jimp';
// import { decode } from 'jpeg-js';
// import { parentPort, workerData } from 'worker_threads';
// import { AnalyseCommandArguments } from '../commands/analyse.command';
// import { MediaInfo } from '../models/report.model';
// Jimp.decoders['image/jpeg'] = (data: Buffer) => decode(data, { maxMemoryUsageInMB: 1024 * 10 });
// async function findCopy(path: string, allFiles: string[]): Promise<string[]> {
//   if (!path.endsWith('.jpeg')) return [];
//   const image: Jimp = await create(path);
//   const compareResult: { file: string; imageDistance: number; }[] = await Promise.all(allFiles
//     .filter(file => file.endsWith('.jpeg'))
//     .filter((file) => file !== path)
//     .map(async (file) => {
//       const image2: Jimp = await create(file);
//       const imageDistance: number = distance(image, image2);
//       return { file, imageDistance };
//     })
//   );
//   return compareResult.filter((result) => result.imageDistance < 0.15)
//     .map((result) => result.file);
// }
// async function analyseChunk(chunk: string[], allFiles: string[], argv: AnalyseCommandArguments): Promise<MediaInfo[]> {
//   const stats: Stats[] = await Promise.all(chunk.map(file => stat(file)));
//   const infos: MediaInfo[] = [];
//   for (let index: number = 0; index < stats.length; ++index) {
//     const stat: Stats = stats[index];
//     const path: string = chunk[index];
//     const size: number = stat.size;
//     const tags: string[] = [];
//     parentPort?.postMessage({
//       currentFile: stat.ino,
//       step: index,
//       stepProgress: 0,
//       mediaInfo: [],
//     })
//     const copy: string[] = await findCopy(path, allFiles);
//     infos.push({ path, tags, size, copy });
//   }
//   return infos;
// }
// const chunk: string[] = workerData.chunk;
// const allFiles: string[] = workerData.allFiles;
// const argv: AnalyseCommandArguments = workerData.argv;
// analyseChunk(chunk, allFiles, argv)
//   .then((infos: MediaInfo[]) => parentPort?.postMessage({
//     currentFile: '.',
//     step: chunk.length,
//     stepProgress: 100,
//     mediaInfo: infos,
//   }))
//   .catch((error: Error) => console.error(error));
