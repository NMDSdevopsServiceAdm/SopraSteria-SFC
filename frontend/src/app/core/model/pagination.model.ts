export interface SearchParams {
  index: number;
  itemsPerPage: number;
  searchTerm?: string;
  sortByValue: string;
}

export interface SearchEvent extends SearchParams {
  callback?: (success: boolean) => void;
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
