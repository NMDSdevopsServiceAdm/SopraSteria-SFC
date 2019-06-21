import { Params } from '@angular/router';

export interface URLStructure {
  url: any[];
  fragment?: string;
  queryParams?: Params;
}
