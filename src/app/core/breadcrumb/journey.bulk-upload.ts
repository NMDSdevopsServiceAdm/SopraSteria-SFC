import { JourneyRoute } from './breadcrumb.model';

enum Path {
  BULK_UPLOAD = '/bulk-upload',
}

export const bulkUploadJourney: JourneyRoute = {
  children: [
    {
      title: 'Bulk upload',
      path: Path.BULK_UPLOAD,
    },
  ],
};
