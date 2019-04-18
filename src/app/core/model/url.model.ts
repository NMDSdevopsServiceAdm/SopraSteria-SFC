import { Params } from '@angular/router';

export interface URLStructure {
  url: string[];
  fragment?: string;
  queryParams?: Params;
}
