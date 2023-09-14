/**
 * Model for the report.
 */
export interface DateInfo {
  /**
   * The year of the date.
   */
  year: string;
  /**
   * The month of the date.
   */
  month: string;
  /**
   * The day of the date.
   */
  day: string;
}

/**
 * Model for the report.
 */
export interface MediaInfo {
  /**
   * The path of the file.
   */
  path: string;
  /**
   * The hash of the file.
   * '' if the file can't be hashed.
   */
  hash: string | null;
  /**
   * The list of tags
   */
  tags: string[];
  /**
   * The list of files that are identical to this one.
   */
  copy: string[];
  /**
   * The date of the file.
   */
  date?: DateInfo;
}

/**
 * Model for the report.
 */
export interface AnalyseReport {
  /**
   * The date of the report.
   */
  reportDate: Date;
  /**
   * The folder that was analysed.
   */
  folder: string;
  /**
   * The number of files that were analysed.
   */
  size: number;
  /**
   * The details of the files that were analysed.
   */
  photos: MediaInfo[];
}