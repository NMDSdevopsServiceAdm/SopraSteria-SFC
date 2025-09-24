import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { EmailsComponent } from './emails.component';

describe('EmailsComponent', () => {
  async function setup() {
    const component = await render(EmailsComponent, {
      imports: [SharedModule, RouterModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {},
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const fixture = component.fixture;

    return {
      component,
      fixture,
    };
  }

  it('should render a EmailsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should contain a targeted emais link that links to sfcadmin/emails/targeted-emails url', async () => {
    const { component } = await setup();

    const targetedEmailsLink = component.getByText('Targeted emails', { exact: false });
    expect(targetedEmailsLink.getAttribute('href')).toBe('/sfcadmin/emails/targeted-emails');
  });

  it('should contain a inactive workplaces to emails link that links to sfcadmin/emails/inactive-emails url', async () => {
    const { component } = await setup();

    const targetedEmailsLink = component.getByText('Inactive workplaces', { exact: false });
    expect(targetedEmailsLink.getAttribute('href')).toBe('/sfcadmin/emails/inactive-emails');
  });
});
