import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Article } from '@core/model/article.model';
import { ArticlesService } from '@core/services/articles.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockArticlesService } from '@core/test-utils/MockArticlesService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { BulkUploadModule } from '@features/bulk-upload/bulk-upload.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ArticleComponent } from './article.component';

describe('ArticleComponent', () => {
  const articles = [
    {
      title: 'test',
      content: 'Testing',
      id: 1,
      date_created: new Date(),
      date_updated: new Date(),
      user_created: 'duhefwiuh',
      user_updated: 'fhewoihf',
    },
  ] as Article[];

  async function setup() {
    const { fixture, getByText } = await render(ArticleComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, BulkUploadModule],
      providers: [
        { provide: ArticlesService, useClass: MockArticlesService },
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                articles,
              },
            },
          },
        },
      ],
    });

    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      router,
      getByText,
    };
  }

  it('should render a ArticleComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display title of article', async () => {
    const { getByText } = await setup();
    expect(getByText(articles[0].title)).toBeTruthy();
  });

  it('should display content of article', async () => {
    const { getByText } = await setup();
    expect(getByText(articles[0].content)).toBeTruthy();
  });
});
