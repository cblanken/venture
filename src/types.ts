export interface PageResult {
  events: string[],
  column_names: string[],
  page_num: number,
  page_size: number,
  total_events: number
}

export interface Column {
  name: string,
  selected: boolean,
  filter: string
}

export interface Event extends Object {
  EventRecordID: number,
  Flagged: boolean
}


export interface SortBy {
  column: Column,
  ascending: boolean
}

export type ColumnMap = Record<string, Column>;

export type SortColumn = Column | null;

// The different states of the app
export enum AppPhase {
  INIT, // First open
  FILE_LOADING, // When loading file
  FILE_LOADED, // Initial load, no filters
  PAGE_LOADING, // Getting a new page
  PAGE_LOADED, // Page loaded
}

// export enum FilterType {
//   Match,
//   DateRange,
//   NumRange
// }

// export class Filter {

//   filterFunction: Function;
//   type: FilterType

//   constructor(filterFunction: Function, type: FilterType) {
//     this.filterFunction = filterFunction;
//     this.type = type;
//   }

//   run(e: Object): boolean {
//     return this.filterFunction(e);
//   }

// }