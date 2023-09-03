"use strict";
// import { ExifData, ExifImage } from 'exif';
// import { AnalyseCommandArguments } from '../commands/analyse.command';
// export class ExifService {
//   public constructor(
//     private readonly argv: AnalyseCommandArguments,
//   ) { }
//   public async getExifData(file: string, buffer: Buffer): Promise<ExifData | undefined> {
//     if (file.endsWith('.jpg') || file.endsWith('.jpeg'))
//       return this.readExif(file, buffer);
//     return undefined;
//   }
// // 
//   private readExif(file: string, buffer: Buffer): Promise<ExifData> {
//     if (this.argv.verbose) console.log(`[${process.pid}] Read EXIF data from ${file}`);
//     return new Promise((resolve, reject) => {
//       try {
//         const image: ExifImage = new ExifImage();
//         image.loadImage(buffer, (error: Error | null, data: ExifData) => {
//           if (error) reject(error);
//           resolve(data);
//         });
//       } catch (error) { reject(error); }
//     });
//   }
// }
