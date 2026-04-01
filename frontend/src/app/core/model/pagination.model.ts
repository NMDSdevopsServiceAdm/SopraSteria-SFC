export interface SearchEvent {
  index: number;
  itemsPerPage: number;
  searchTerm: string;
  sortByValue: string;
}

export interface QueryParamsForBackend {
  pageIndex: number;
  itemsPerPage: number;
  searchTerm?: string;
  sortBy: string;
}

export interface QueryParamsForWorkerWithPayData {
  pageIndex: number;
  itemsPerPage: number;
  jobId?: number;
  sortBy: string;
}

export const parseSearchEvent = (searchEvent: SearchEvent): QueryParamsForBackend => {
  const { index, itemsPerPage, sortByValue, searchTerm } = searchEvent;
  return {
    pageIndex: index,
    itemsPerPage: itemsPerPage,
    sortBy: sortByValue,
    ...(searchTerm ? { searchTerm } : {}),
  };
};

export const parseSearchEventForWorkerWithPayData = (searchEvent: SearchEvent): QueryParamsForWorkerWithPayData => {
  const { index, itemsPerPage, sortByValue, searchTerm } = searchEvent;
  return {
    pageIndex: index,
    itemsPerPage: itemsPerPage,
    sortBy: sortByValue,
    ...(searchTerm ? { jobId: Number(searchTerm) } : {}),
  };
};
