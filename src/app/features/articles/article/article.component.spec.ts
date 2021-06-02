import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ApolloQueryResult, NetworkStatus } from '@apollo/client/core';
import { Article } from '@core/model/article.model';
import { ArticlesService } from '@core/services/articles.service';
import { MockArticlesService } from '@core/test-utils/MockArticlesService';
import { BulkUploadModule } from '@features/bulk-upload/bulk-upload.module';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ArticleComponent } from './article.component';

describe('ArticleComponent', () => {
  const networkStatus = {} as NetworkStatus;
  const article = {
    data: {
      articles: [
        {
          title: 'test',
          content: 'Testing',
          id: 1,
          date_created: new Date(),
          date_updated: new Date(),
          user_created: 'duhefwiuh',
          user_updated: 'fhewoihf',
        },
      ],
    },
    loading: false,
    networkStatus,
  } as ApolloQueryResult<Article>;
  async function setup() {
    const component = await render(ArticleComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, BulkUploadModule],
      providers: [
        {
          provide: ArticlesService,
          useClass: MockArticlesService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                article,
              },
            },
          },
        },
      ],
    });

    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const componentInstance = component.fixture.componentInstance;
    return {
      component,
      router,
      componentInstance,
    };
  }

  it('should render a ArticleComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
