import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { EligibilityIconComponent } from './eligibility-icon.component';

describe('EligibilityIconComponent', () => {
  const setup = async (overallEligibility: boolean, currentRowEligible: boolean) => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(EligibilityIconComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
      componentProperties: { overallEligibility: overallEligibility, eligible: currentRowEligible },
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
  };

  it('should render a EligibilityIconComponent', async () => {
    const { component } = await setup(true, true);
    expect(component).toBeTruthy();
  });

  it('should not display a message when user meets WDF requirements overall and the current row is eligible', async () => {
    const { component, fixture } = await setup(true, true);

    component.displayCorrectIcon();
    fixture.detectChanges();

    expect(component.label).toEqual('');
    expect(component.icon).toEqual('');
  });

  it('should display the "You need to add this information" message and orange flag when user meets WDF requirements overall but current row is empty', async () => {
    const { component, fixture } = await setup(true, false);
    const expectedMessage = 'You need to add this information';
    const orangeFlagIcon = 'flag-orange';

    component.displayCorrectIcon();
    fixture.detectChanges();

    expect(component.label).toEqual(expectedMessage);
    expect(component.icon).toEqual(orangeFlagIcon);
  });

  it('should display the "You need to add this information" message and orange flag when user meets WDF requirements overall but current row is empty', async () => {
    const { component, fixture } = await setup(false, false);
    const expectedMessage = 'You need to add this information';
    const redCrossIcon = 'cross-icon';

    component.displayCorrectIcon();
    fixture.detectChanges();

    expect(component.label).toEqual(expectedMessage);
    expect(component.icon).toEqual(redCrossIcon);
  });
});
