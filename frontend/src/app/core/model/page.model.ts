export interface Page {
  id?: number;
  status?: string;
  user_created?: string;
  date_created?: Date;
  user_updated?: string;
  date_updated?: Date;
  content?: string;
  title?: string;
  publish_date?: Date;
  slug?: string;
}

export interface Pages {
  data: Page[];
}
