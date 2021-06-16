import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Pages } from '@core/model/page.model';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { PageContentComponent } from './page-content.component';

describe('PageContentComponent', () => {
  const pages = {
    data: [
      {
        title: 'About the ASC-WDS',
        content: 'Testing',
        id: 1,
        date_created: new Date(),
        date_updated: new Date(),
        user_created: 'duhefwiuh',
        user_updated: 'fhewoihf',
      },
    ],
  } as Pages;

  async function setup() {
    const { fixture, getByText } = await render(PageContentComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            params: [],
            url: of(['testUrl']),
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
});
