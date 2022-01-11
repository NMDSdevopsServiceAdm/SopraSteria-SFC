import { JourneyRoute } from './breadcrumb.model';

enum Path {
  BULK_UPLOAD = '/bulk-upload',
  ABOUT_BULK_UPLOAD = '/bulk-upload/about-bulk-upload',
  WORKPLACE_REFERENCES = '/bulk-upload/workplace-references',
  STAFF_REFERENCES = '/bulk-upload/workplace-references/:uid/staff-references',
  LAST_BULK_UPLOAD = '/bulk-upload/last-bulk-upload',
  MISSING_REFERENCES = '/bulk-upload/missing',
  ERROR_REPORT = '/bulk-upload/error-report',
  START_PAGE = '/bulk-upload/start',
  GET_HELP = '/bulk-upload/get-help',
  TROUBLESHOOTING_PAGE = '/bulk-upload/troubleshooting',
}

export const bulkUploadJourney: JourneyRoute = {
  children: [
    {
      title: 'Bulk upload',
      path: Path.MISSING_REFERENCES,
    },
    {
      title: 'Bulk Upload',
      path: Path.START_PAGE,
    },
    {
      title: 'Bulk upload',
      path: Path.BULK_UPLOAD,
      children: [
        {
          title: 'Get help with bulk uploads',
          path: Path.GET_HELP,
        },
        {
          title: 'Last bulk upload',
          path: Path.LAST_BULK_UPLOAD,
        },
        {
          title: 'Error report',
          path: Path.ERROR_REPORT,
        },
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
      ],
    },
  ],
};

export const bulkUploadHelpJourney: JourneyRoute = {
  children: [
    {
      title: 'Bulk upload',
      path: Path.MISSING_REFERENCES,
    },
    {
      title: 'Bulk Upload',
      path: Path.START_PAGE,
    },
    {
      title: 'Bulk upload',
      path: Path.BULK_UPLOAD,
      children: [
        {
          title: 'Get help with bulk uploads',
          path: Path.GET_HELP,
          children: [
            {
              title: 'Troubleshooting',
              path: Path.TROUBLESHOOTING_PAGE,
            },
          ],
        },
      ],
    },
  ],
};
