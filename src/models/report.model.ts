
export interface MediaHash {
  path: string;
  hash: string | null;
}

export interface MediaInfo {
  path: string; 
  hash: string | null;
  tags: string[];
  copy: string[];
  date?: string;
}

export interface AnalyseReport {
  reportDate: Date;
  folder: string;
  size: number;
  photos: MediaInfo[];
}