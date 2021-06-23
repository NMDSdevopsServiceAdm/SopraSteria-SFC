import { Injectable } from '@angular/core';
import { Articles } from '@core/model/article.model';
import { ArticlesService } from '@core/services/articles.service';

@Injectable()
export class MockArticlesService extends ArticlesService {
  public static articlesFactory(): Articles {
    return {
      data: [
        {
          title: 'Test article',
          content: 'Testing',
          id: 1,
          date_created: new Date(),
          date_updated: new Date(),
          user_created: 'testUser',
          user_updated: 'testUser',
          slug: 'test-article',
          publish_date: new Date(),
          status: 'Published',
        },
      ],
    };
  }

  public static articleListFactory(): Articles {
    return {
      data: [
        { title: 'Test article 1', slug: 'test-slug' },
        { title: 'Test article 2', slug: 'test2-slug' },
        { title: 'Test article 3', slug: 'test3-slug' },
      ],
    };
  }
}
