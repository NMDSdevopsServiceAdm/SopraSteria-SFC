import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockPagesService } from '@core/test-utils/MockPagesService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { PublicPageComponent } from './public-page.component';

describe('PublicPageComponent', () => {
  const pages = MockPagesService.pagesFactory();

  async function setup(returnToHomeButton = false) {
    const { fixture, getByText, queryByText } = await render(PublicPageComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            params: [],
            url: of(['testUrl']),
            data: of({
              returnToHomeButton,
            }),
            snapshot: {
              data: {
                pages,
              },
            },
          }),
        },
      ],
    });

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByText,
      queryByText,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display title from the pages data', async () => {
    const { getByText } = await setup();
    expect(getByText(pages.data[0].title)).toBeTruthy();
  });

  it('should display content from the pages data', async () => {
    const { getByText } = await setup();
    expect(getByText(pages.data[0].content)).toBeTruthy();
  });

  it('should not display return to home button when returnToHomeButton set to false in routing', async () => {
    const { queryByText } = await setup();
    expect(queryByText('Return to home')).toBeFalsy();
  });

  it('should display return to home button when returnToHomeButton set to true in routing', async () => {
    const { queryByText } = await setup(true);
    expect(queryByText('Return to home')).toBeTruthy();
  });
});
