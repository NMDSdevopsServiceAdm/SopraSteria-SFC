import { JourneyRoute } from './breadcrumb.model';

enum Path {
  BULK_UPLOAD = '/bulk-upload',
}

export const bulkUploadJourney: JourneyRoute = {
  children: [
    {
      title: 'Bulk upload',
      url: Path.BULK_UPLOAD,
    },
  ],
};
