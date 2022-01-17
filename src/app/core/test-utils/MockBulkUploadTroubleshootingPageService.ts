import { Injectable } from '@angular/core';
import { BulkUploadTroubleshootingPages } from '@core/model/bulk-upload-troubleshooting-page.model';
import { BulkUploadTroubleshootingPagesService } from '@core/services/bulk-upload/bulkUploadTroubleshootingPages.service';

@Injectable()
export class MockBulkUploadTroubleshootingPagesService extends BulkUploadTroubleshootingPagesService {
  public static bulkUploadTroubleShootingPageFactory(): BulkUploadTroubleshootingPages {
    return {
      data: [
        {
          id: 1,
          title: 'Troubleshooting Header 1',
          content: 'Troubleshooting content 1',
        },
      ],
    };
  }

  public static bulkUploadTroubleShootingPagesFactory(): BulkUploadTroubleshootingPages {
    return {
      data: [
        { title: 'Troubleshooting Header 1', content: 'Troubleshooting content 1' },
        { title: 'Troubleshooting Header 2', content: 'Troubleshooting content 2' },
        { title: 'Troubleshooting Header 3', content: 'Troubleshooting content 3' },
      ],
    };
  }
}
