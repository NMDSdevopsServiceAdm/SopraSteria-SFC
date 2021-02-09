import { JourneyRoute } from './breadcrumb.model';

enum Path {
  BULK_UPLOAD = '/bulk-upload',
  ABOUT_BULK_UPLOAD = '/bulk-upload/about-bulk-upload',
  WORKPLACE_REFERENCES = '/bulk-upload/workplace-references',
  STAFF_REFERENCES = '/bulk-upload/workplace-references/:uid/staff-references',
  LAST_BULK_UPLOAD = '/bulk-upload/last-bulk-upload',
}

export const bulkUploadJourney: JourneyRoute = {
  children: [
    {
      title: 'Bulk upload',
      path: Path.BULK_UPLOAD,
      children: [
        {
          title: 'About bulk upload',
          path: Path.ABOUT_BULK_UPLOAD,
        },
        {
          title: 'References',
          path: Path.WORKPLACE_REFERENCES,
          children: [
            {
              title: 'Staff references',
              path: Path.STAFF_REFERENCES,
            },
          ],
        },
        {
          title: 'Last bulk upload',
          path: Path.LAST_BULK_UPLOAD,
        },
      ],
    },
  ],
};
