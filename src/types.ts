export type BackendFile = {
  file: string;
  content: string;
};

export type SearchResults = {
  score: number;
  indices: number[];
  file: string;
}[];

export type Result<T, E> = [T, E];
