import chalk from 'chalk';
import { join } from 'path';
import { AnalyseArgument } from '../../models/arguments.model';
import { CommandHandler } from '../../models/handler.model';
import { MediaInfo } from '../../models/report.model';
import { FileExplorer } from '../../services/file-explorer.service';
import { WorkerService } from '../../services/worker.service';
import { formatTimeMesage, log } from '../../utils/log.util';

type AnalyseData = {
  files: string[];
  oldAnalysis: MediaInfo[];
}

/**
 * Analyse command handler.
 * @returns The command handler.
 */
export function analyseCommandHandler(): CommandHandler<AnalyseArgument> {
  return async (argv: AnalyseArgument) => {
    try {
      const startTick: number = performance.now();
      const pscFile: string = argv.output ?? join(argv.folder, '.psc.json');
      log(argv, chalk.gray(`Analysing ${argv.folder}...`));
      const fileExplorer: FileExplorer = new FileExplorer(argv.folder, argv);
      const workerService: WorkerService<AnalyseArgument> = new WorkerService<AnalyseArgument>(argv);
      const { files, oldAnalysis }: AnalyseData = await findFilesToAnalyse(fileExplorer, pscFile, argv);
      const mediaInfos: Partial<MediaInfo>[] = files.map((path: string) => ({ path }));
      log(argv, `Found ${mediaInfos.length} files in ${formatTimeMesage(startTick)}`);
      const analysedMediaInfo: MediaInfo[] = await workerService.runJobs<Partial<MediaInfo>, MediaInfo>(mediaInfos, 'analyse');
      log(argv, `Analysed ${analysedMediaInfo.length} files in ${formatTimeMesage(startTick)}`);
      const fullMediaDateInfos: MediaInfo[] = [...analysedMediaInfo, ...oldAnalysis];
      await fileExplorer.writeJson(pscFile, fullMediaDateInfos);
      log(argv, formatReport(analysedMediaInfo, oldAnalysis, startTick, pscFile));
    } catch (error) { console.error(error); }
  };
}

/**
 * Find the files to analyse.
 * @param fileExplorer The file explorer to use.
 * @param pscFile The path to the psc file.
 */
async function findFilesToAnalyse(fileExplorer: FileExplorer, pscFile: string, {folder, cache}: AnalyseArgument): Promise<AnalyseData> {
  const files: string[] = await fileExplorer.getFiles();
  if (!cache) return { files, oldAnalysis: [] };
  const oldAnalysis: MediaInfo[] = await fileExplorer.readJson<MediaInfo[]>(pscFile, []);
  return {
    files: files.filter((file: string) => {
      const targetFile: string = file.replace(folder, '.');
      return !oldAnalysis.some(({path}: MediaInfo) => path === targetFile);
    }),
    oldAnalysis,
  };
}

/**
 * Format the report.
 * 
 * @param mediaInfos The media infos.
 * @param oldAnalysis The old analysis.
 * @param startTick The start tick.
 * @param pscFile The psc file.
 * @returns The formatted report.
 */
function formatReport(mediaInfos: MediaInfo[], oldAnalysis: MediaInfo[], startTick: number, pscFile: string): string {
  const time: string = formatTimeMesage(performance.now() - startTick);
  return `
  Report saved to ${chalk.gray(pscFile)}.

  ${chalk.magenta(mediaInfos.length)} files analysed in ${chalk.green(time)}.

  ${chalk.magenta(mediaInfos.filter((mediaInfo: MediaInfo) => mediaInfo.date).length)} files dated.
  ${chalk.magenta(mediaInfos.filter((mediaInfo: MediaInfo) => mediaInfo.copy.length > 0).length)} files with copy.

  The report contains ${chalk.magenta(oldAnalysis.length)} files from previous analysis.
  Now contains ${chalk.magenta(mediaInfos.length + oldAnalysis.length)} files.
  `;
}