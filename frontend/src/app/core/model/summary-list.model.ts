import { URLStructure } from '@core/model/url.model';

export interface SummaryList {
  label: string;
  data: string;
  route?: URLStructure;
  showNewFlag?: boolean;
  ariaDescription?: string;
}
