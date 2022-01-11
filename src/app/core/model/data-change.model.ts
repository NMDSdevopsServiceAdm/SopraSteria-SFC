export interface DataChange {
  id?: number;
  content?: string;
  title?: string;
  last_updated: Date;
}

export interface DataChanges {
  data: DataChange[];
}
