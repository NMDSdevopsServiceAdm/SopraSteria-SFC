export interface BulkUploadTopTip {
  id?: number;
  user_created?: string;
  date_created?: Date;
  user_updated?: string;
  date_updated?: Date;
  content?: string;
  title?: string;
  slug?: string;
}

export interface BulkUploadTopTips {
  data: BulkUploadTopTip[];
}
