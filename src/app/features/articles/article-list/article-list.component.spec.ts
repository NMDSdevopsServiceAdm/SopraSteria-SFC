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

import { ArticleListComponent } from './article-list.component';

describe('ArticleListComponent', () => {
  const articleList = [
    { title: 'test', slug: 'test-slug' },
    { title: 'test2', slug: 'test2-slug' },
    { title: 'test3', slug: 'test3-slug' },
  ] as Article[];
  const articles = [{ title: 'test2', slug: 'test2-slug' }];

  async function setup() {
    const { fixture, getByText } = await render(ArticleListComponent, {
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
                articleList,
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
    return { component, fixture, router, getByText };
  }

  it('should render a ArticleListComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the titles of the three latest articles', async () => {
    const { getByText } = await setup();
    expect(getByText(articleList[0].title)).toBeTruthy();
    expect(getByText(articleList[1].title)).toBeTruthy();
    expect(getByText(articleList[2].title)).toBeTruthy();
  });

  it('should have the slugs of the three latest articles in the hrefs', async () => {
    const { getByText } = await setup();

    const firstArticleLink = getByText(articleList[0].title);
    const secondArticleLink = getByText(articleList[1].title);
    const thirdArticleLink = getByText(articleList[2].title);

    expect(firstArticleLink.getAttribute('href')).toContain(articleList[0].slug);
    expect(secondArticleLink.getAttribute('href')).toContain(articleList[1].slug);
    expect(thirdArticleLink.getAttribute('href')).toContain(articleList[2].slug);
  });

  it('should show current article in bold and not show other articles in bold', async () => {
    const { component, fixture, getByText } = await setup();

    const secondArticleLink = getByText(articleList[1].title).closest('li');
    const firstArticleLink = getByText(articleList[0].title).closest('li');
    const thirdArticleLink = getByText(articleList[2].title).closest('li');

    component.currentArticleSlug = articleList[1].slug;
    fixture.detectChanges();

    expect(secondArticleLink.classList).toContain('govuk-!-font-weight-bold');
    expect(firstArticleLink.classList).not.toContain('govuk-!-font-weight-bold');
    expect(thirdArticleLink.classList).not.toContain('govuk-!-font-weight-bold');
  });
});
