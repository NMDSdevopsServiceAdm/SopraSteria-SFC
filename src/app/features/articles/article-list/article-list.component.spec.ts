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

import { ArticleListComponent } from './article-list.component';

describe('ArticleListComponent', () => {
  const articleList = MockArticlesService.articleListFactory();
  const articles = MockArticlesService.articlesFactory();

  async function setup() {
    const { fixture, getByText, queryByText } = await render(ArticleListComponent, {
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
                articleList,
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
    return { component, fixture, getByText, queryByText };
  }

  it('should render a ArticleListComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the titles of the three latest articles', async () => {
    const { getByText } = await setup();
    expect(getByText(articleList.data[0].title)).toBeTruthy();
    expect(getByText(articleList.data[1].title)).toBeTruthy();
    expect(getByText(articleList.data[2].title)).toBeTruthy();
  });

  it('should have the slugs of the three latest articles in the hrefs', async () => {
    const { getByText } = await setup();

    const firstArticleLink = getByText(articleList.data[0].title);
    const secondArticleLink = getByText(articleList.data[1].title);
    const thirdArticleLink = getByText(articleList.data[2].title);

    expect(firstArticleLink.getAttribute('href')).toContain(articleList.data[0].slug);
    expect(secondArticleLink.getAttribute('href')).toContain(articleList.data[1].slug);
    expect(thirdArticleLink.getAttribute('href')).toContain(articleList.data[2].slug);
  });

  it('should show current article in bold and not show other articles in bold', async () => {
    const { component, fixture, getByText } = await setup();

    const secondArticleLink = getByText(articleList.data[1].title).closest('li');
    const firstArticleLink = getByText(articleList.data[0].title).closest('li');
    const thirdArticleLink = getByText(articleList.data[2].title).closest('li');

    component.articleList[1].slug = 'matching-slug';
    component.currentArticleSlug = 'matching-slug';
    fixture.detectChanges();

    expect(secondArticleLink.classList).toContain('govuk-!-font-weight-bold');
    expect(firstArticleLink.classList).not.toContain('govuk-!-font-weight-bold');
    expect(thirdArticleLink.classList).not.toContain('govuk-!-font-weight-bold');
  });

  it('should not display anything when article list is empty', async () => {
    const { component, fixture, queryByText } = await setup();

    component.articleList = [];
    fixture.detectChanges();

    expect(queryByText('ASC-WDS news')).toBeFalsy();
  });
});
