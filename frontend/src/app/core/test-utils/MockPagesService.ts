import { Injectable } from '@angular/core';
import { Pages } from '@core/model/page.model';
import { PagesService } from '@core/services/pages.service';

@Injectable()
export class MockPagesService extends PagesService {
  public static pagesFactory(): Pages {
    return {
      data: [
        {
          title: 'Test page',
          content: 'Testing',
          id: 1,
          date_created: new Date(),
          date_updated: new Date(),
          user_created: 'testUser',
          user_updated: 'testUser',
          slug: 'test-page',
          publish_date: new Date(),
          status: 'Published',
        },
      ],
    };
  }
}
