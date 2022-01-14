import { Injectable } from '@angular/core';
import { BulkUploadTroubleshootingPages } from '@core/model/bulk-upload-troubleshooting-page.model';
import { BulkUploadTroubleshootingPagesService } from '@core/services/bulk-upload/bulkUploadTroubleshootingPages.service';

@Injectable()
export class MockBulkUploadTroubleshootingPagesService extends BulkUploadTroubleshootingPagesService {
  public static bulkUploadTroubleShootingLinkFactory(): BulkUploadTroubleshootingPages {
    return {
      data: [
        {
          id: 1,
          title: '',
          content: 'I am a troubleshooting link',
          slug: 'troubleshooting',
        },
      ],
    };
  }
}
