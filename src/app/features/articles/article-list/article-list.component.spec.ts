import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ApolloQueryResult, NetworkStatus } from '@apollo/client/core';
import { ArticleList } from '@core/model/articlelist.model';
import { ArticleListsService } from '@core/services/articlelists.service';
import { MockArticleListsService } from '@core/test-utils/MockArticleListsService';
import { BulkUploadModule } from '@features/bulk-upload/bulk-upload.module';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ArticleListComponent } from './articlelist.component';

describe('ArticleListComponent', () => {
  const networkStatus = {} as NetworkStatus;
  const articlelist = {
    data: {
      articlelists: [
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
  } as ApolloQueryResult<ArticleList>;
  async function setup() {
    const component = await render(ArticleListComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, BulkUploadModule],
      providers: [
        {
          provide: ArticleListsService,
          useClass: MockArticleListsService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                articlelist,
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

  it('should render a ArticleListComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
