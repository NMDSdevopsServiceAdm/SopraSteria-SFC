import { Injectable } from '@angular/core';
import { HelpPages } from '@core/model/help-pages.model';
import { HelpPagesService } from '@core/services/help-pages.service';

@Injectable()
export class MockHelpPagesService extends HelpPagesService {
  public static helpPagesFactory(overrides?: any): HelpPages {
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
          link_title: 'link',
          ...overrides,
        },
      ],
    };
  }
}
