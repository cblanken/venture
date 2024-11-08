export interface PageResult {
  events: string[],
  page_num: number,
  page_size: number,
  total_events: number
}

export interface Column {
  name: string,
  selected: boolean
}

class Filter {

  filterFunction: Function;

  constructor(filterFunction: Function) {
    this.filterFunction = filterFunction;
  }

  run(e: Object): boolean {
    return this.filterFunction(e);
  }

}