import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';

import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { MockUsefulLinksService } from '@core/test-utils/MockUsefulLinksService';
import { DataAreaUsefulLinkPayComponent } from './data-area-useful-link-pay.component';
describe('DataAreaUsefulLinkPayComponent', () => {
  const usefulLinksPay = MockUsefulLinksService.usefulLinkFactory();

  async function setup() {
    const { fixture, getByText } = await render(DataAreaUsefulLinkPayComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              data: {
                usefulLinksPay,
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

  it('should display title of the useful lonks pay page', async () => {
    const { getByText } = await setup();

    expect(getByText(usefulLinksPay.data.title)).toBeTruthy();
  });

  it('should display content of the Data useful links pay page', async () => {
    const { getByText } = await setup();
    expect(getByText(usefulLinksPay.data.content)).toBeTruthy();
  });
});
