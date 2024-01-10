import { Injectable } from '@angular/core';

import { UsefulLinksService } from '@core/services/useful-links.service';

@Injectable()
export class MockUsefulLinksService extends UsefulLinksService {
  public static usefulLinkFactory() {
    return {
      data: {
        title: 'Test page',
        content: 'Testing',
        id: 1,

        user_created: 'testUser',
        user_updated: 'testUser',

        status: 'Published',
      },
    };
  }
}
