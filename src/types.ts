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