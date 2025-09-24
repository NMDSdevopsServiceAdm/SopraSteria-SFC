import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';

import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { MockUsefulLinksService } from '@core/test-utils/MockUsefulLinksService';
import { DataAreaUsefulLinkRecruitmentComponent } from './data-area-useful-link-recruitment.component';

describe('DataAreaUsefulLinkRecruitmentComponent', () => {
  const usefulLinkRecruitment = MockUsefulLinksService.usefulLinkFactory();

  async function setup(returnData = true) {
    const { fixture, getByText, queryByTestId } = await render(DataAreaUsefulLinkRecruitmentComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              data: {
                usefulLinkRecruitment: returnData ? usefulLinkRecruitment : null,
              },
            },
          }),
        },
      provideHttpClient(), provideHttpClientTesting(),],
    });

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByText,
      queryByTestId,
    };
  }
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display title of the useful lonks recruitment page', async () => {
    const { getByText } = await setup();
    expect(getByText(usefulLinkRecruitment.data.title)).toBeTruthy();
  });

  it('should display content of the Data useful links recruitment page', async () => {
    const { getByText } = await setup();
    expect(getByText(usefulLinkRecruitment.data.content)).toBeTruthy();
  });

  it('should not render when no data', async () => {
    const { queryByTestId } = await setup(false);
    expect(queryByTestId('usefulLinkRecruitmentTestId')).toBeFalsy();
  });
});