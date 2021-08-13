import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AddWorkplaceModule } from '../add-workplace.module';
import { WorkplaceAddedThankYouComponent } from './workplace-added-thank-you.component';

describe('WorkplaceAddedThankYouComponent', () => {
  async function setup() {
    const component = await render(WorkplaceAddedThankYouComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, AddWorkplaceModule],
      providers: [],
    });

    return {
      component,
    };
  }

  it('should render a WorkplaceAddedThankYouComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should say thank you', async () => {
    const { component } = await setup();
    expect(component.getByText('Thank you')).toBeTruthy();
  });

  it('should go to contact us when link clicked', async () => {
    const { component } = await setup();

    const contactUs = component.getByText('Contact us', { exact: false });

    expect(contactUs.getAttribute('href')).toBe('/contact-us');
  });

  it('should navigate to dashboard when Return to home link clicked', async () => {
    const { component } = await setup();

    const returnToHome = component.getByText('Return to home', { exact: false });

    expect(returnToHome.getAttribute('href')).toBe('/dashboard');
  });
});
