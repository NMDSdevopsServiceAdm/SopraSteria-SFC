import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { GrantLetterSentComponent } from './grant-letter-sent.component';

describe('GrantLetterSentComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getByTestId, queryByText } = await render(GrantLetterSentComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getByTestId, queryByText };
  };

  it('should render a WdfGrantLetterComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Top of page paragraph', async () => {
    it('should display header for grant letter sent', async () => {
      const { getByText } = await setup();
      expect(getByText('The grant letter has been sent')).toBeTruthy();
    });

    it('should display paragraph for grant letter sent page', async () => {
      const { getByTestId } = await setup();
      const paragraph = getByTestId('info');
      expect(paragraph).toBeTruthy();
    });
  });

  it('should navigate to dashboard when  Return to home is clicked', async () => {
    const { getByText } = await setup();

    const returnToDashboard = getByText('Return to home', { exact: false });

    expect(returnToDashboard.getAttribute('href')).toBe('/dashboard');
  });
});
