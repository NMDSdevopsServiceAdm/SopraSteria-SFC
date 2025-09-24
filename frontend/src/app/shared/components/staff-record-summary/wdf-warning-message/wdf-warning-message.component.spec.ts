import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { FundingModule } from '@features/funding/funding.module';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WdfWarningMessageComponent } from './wdf-warning-message.component';

describe('WdfWarningMessageComponent', () => {
  const setup = async (overrides: any = {}) => {
    const { fixture, getByText, queryByAltText, queryByText } = await render(WdfWarningMessageComponent, {
      imports: [SharedModule, RouterTestingModule, BrowserModule, FundingModule],
      componentProperties: {
        overallWdfEligibility: false,
        warningMessage: null,
        ...overrides,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      queryByAltText,
      queryByText,
      getByText,
    };
  };

  it("should display 'Add this information' message and red flag when not eligible overall", async () => {
    const { getByText, queryByAltText } = await setup({ overallWdfEligibility: false });

    expect(getByText('Add this information')).toBeTruthy();
    expect(queryByAltText('Red flag icon')).toBeTruthy();

    expect(queryByAltText('Orange flag icon')).toBeFalsy();
  });

  it("should display 'Add this information' message and orange flag when eligible overall", async () => {
    const { getByText, queryByAltText } = await setup({ overallWdfEligibility: true });

    expect(queryByAltText('Red flag icon')).toBeFalsy();

    expect(getByText('Add this information')).toBeTruthy();
    expect(queryByAltText('Orange flag icon')).toBeTruthy();
  });

  it('should display message passed in and red flag when not eligible overall  and specific warning message provided', async () => {
    const specificMessage = 'Add the capacity of your main service';

    const { getByText, queryByAltText } = await setup({
      overallWdfEligibility: false,
      warningMessage: specificMessage,
    });

    expect(getByText(specificMessage)).toBeTruthy();
    expect(queryByAltText('Red flag icon')).toBeTruthy();

    expect(queryByAltText('Orange flag icon')).toBeFalsy();
  });

  it('should display message passed in and orange flag when eligible overall and specific warning message provided', async () => {
    const specificMessage = 'Add the capacity of your main service';

    const { getByText, queryByAltText } = await setup({
      overallWdfEligibility: true,
      warningMessage: specificMessage,
    });

    expect(queryByAltText('Red flag icon')).toBeFalsy();

    expect(getByText(specificMessage)).toBeTruthy();
    expect(queryByAltText('Orange flag icon')).toBeTruthy();
  });
});
