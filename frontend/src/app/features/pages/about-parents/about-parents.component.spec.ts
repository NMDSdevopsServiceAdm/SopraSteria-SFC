import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockArticlesService } from '@core/test-utils/MockArticlesService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPagesService } from '@core/test-utils/MockPagesService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { AboutParentsComponent } from './about-parents.component';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { MockPreviousRouteService } from '@core/test-utils/MockPreviousRouteService';

describe('AboutParentsComponent', () => {
  const pages = MockPagesService.pagesFactory();
  const articleList = MockArticlesService.articleListFactory();

  const setup = async (previousUrl = '') => {
    const { fixture, getByText } = await render(AboutParentsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            params: [],
            url: of(['testUrl']),
            snapshot: {
              data: {
                pages,
                articleList,
              },
            },
          }),
        },
        {
          provide: PreviousRouteService,
          useFactory: MockPreviousRouteService.factory(previousUrl),
          deps: [Router],
        },
      provideHttpClient(), provideHttpClientTesting(),],
    });

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByText,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display title from the pages data', async () => {
    const { getByText } = await setup();
    expect(getByText('What you can do as a parent workplace')).toBeTruthy();
  });

  it('should display content from the pages data', async () => {
    const { getByText } = await setup();
    expect(getByText(pages.data[0].content)).toBeTruthy();
  });

  it('should display the correct button text if the previous page was home', async () => {
    const { getByText } = await setup('/dashboard#home');
    expect(getByText('Return to home')).toBeTruthy();
  });

  it('should display the correct button text if the previous page was your other workplaces', async () => {
    const { getByText } = await setup('/workplace/view-all-workplaces');
    expect(getByText('Return to your other workplaces')).toBeTruthy();
  });

  it('should display the correct button text if there is no previous page', async () => {
    const { getByText } = await setup();
    expect(getByText('Return to previous page')).toBeTruthy();
  });
});