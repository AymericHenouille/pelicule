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
   * undefined if the file is not hashed.
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
  reportDate: Date;
  folder: string;
  size: number;
  photos: MediaInfo[];
}