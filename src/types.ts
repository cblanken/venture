export interface PageResult {
  events: string[],
  page_num: number,
  page_size: number,
  total_events: number
}

export interface Column {
  name: string,
  selected: boolean,
  filter: string
}

export type ColumnMap = Record<string, Column>;

export type SortColumn = Column | null;

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