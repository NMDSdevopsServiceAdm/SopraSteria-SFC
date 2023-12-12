import { Injectable } from '@angular/core';
import { BulkUploadTopTips } from '@core/model/bulk-upload-top-tips.model';
import { BulkUploadTopTipsService } from '@core/services/bulk-upload/bulk-upload-top-tips.service';

@Injectable()
export class MockBulkUploadTopTipsService extends BulkUploadTopTipsService {
  public static topTipFactory(): BulkUploadTopTips {
    return {
      data: [
        {
          id: 1,
          title: 'Top tip 1',
          content: 'This is the first top tip',
          slug: 'top-tip-one',
          link_title: 'First top tip',
        },
      ],
    };
  }

  public static topTipsListFactory(): BulkUploadTopTips {
    return {
      data: [
        { title: 'Top tip 1', slug: 'top-tip-one', link_title: 'First top tip' },
        { title: 'Top tip 2', slug: 'top-tip-two', link_title: 'Second top tip' },
        { title: 'Top tip 3', slug: 'top-tip-three', link_title: 'Third top tip' },
      ],
    };
  }
}
