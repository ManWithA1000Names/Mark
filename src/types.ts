export namespace Payloads {
  export type File = {
    file: string;
    content: string;
  };

  export type SearchResults = {
    score: number;
    indices: number[];
    file: string;
  }[];
}
