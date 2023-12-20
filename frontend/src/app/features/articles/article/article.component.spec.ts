import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ArticlesService } from '@core/services/articles.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockArticlesService } from '@core/test-utils/MockArticlesService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { of, Subject } from 'rxjs';

import { ArticleComponent } from './article.component';

describe('ArticleComponent', () => {
  const articles = MockArticlesService.articlesFactory();

  async function setup() {
    const { fixture, getByText } = await render(ArticleComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: ArticlesService, useClass: MockArticlesService },
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            params: [],
            url: of(['testUrl']),
            snapshot: {
              data: {
                articles,
              },
            },
          }),
        },
      ],
    });

    const injector = getTestBed();
    const event = new NavigationEnd(42, '/', '/');
    ((injector.inject(Router).events as unknown) as Subject<RouterEvent>).next(event);

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByText,
    };
  }

  it('should render a ArticleComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display title of article', async () => {
    const { getByText } = await setup();
    expect(getByText(articles.data[0].title)).toBeTruthy();
  });

  it('should display content of article', async () => {
    const { getByText } = await setup();
    expect(getByText(articles.data[0].content)).toBeTruthy();
  });
});
