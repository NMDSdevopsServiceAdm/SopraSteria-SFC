import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WindowRef } from '@core/services/window.ref';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { SearchModule } from '../search.module';
import { EmailsComponent } from './emails.component';

const emailHistory = [
  {
    date: '2021-01-05',
    emails: 351,
  },
  {
    date: '2020-12-05',
    emails: 772,
  },
];

describe('EmailsComponent', () => {
  async function setup() {
    return render(EmailsComponent, {
      imports: [SharedModule, SearchModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                emailCampaignHistory: [],
                inactiveWorkplaces: { inactiveWorkplaces: 0 },
              },
            },
          },
        },
      ],
    });
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the total number of inactive workplaces', async () => {
    const component = await setup();
    component.fixture.componentInstance.inactiveWorkplaces = 1250;
    component.fixture.detectChanges(true);
    const numInactiveWorkplaces = component.getByTestId('inactiveWorkplaces');
    expect(numInactiveWorkplaces.innerHTML).toContain('1,250');
  });

  it('should display all existing history', async () => {
    const component = await setup();
    component.fixture.componentInstance.history = emailHistory;
    component.fixture.detectChanges(true);
    const numInactiveWorkplaces = component.getByTestId('emailCampaignHistory');
    expect(numInactiveWorkplaces.innerHTML).toContain('05/01/2021');
    expect(numInactiveWorkplaces.innerHTML).toContain('772');
    expect(numInactiveWorkplaces.innerHTML).toContain('05/12/2020');
    expect(numInactiveWorkplaces.innerHTML).toContain('351');
  });

  it('should display a message when no emails have been sent', async () => {
    const component = await setup();
    // component.fixture.componentInstance.history = [];
    // component.fixture.detectChanges(true);
    const numInactiveWorkplaces = component.getByTestId('emailCampaignHistory');
    expect(numInactiveWorkplaces.innerHTML).toContain('No emails have been sent yet.');
  });

  it('should call confirmSendEmails when the "Send emails" button is clicked', async () => {
    const component = await setup();
    const spy = spyOn(component.fixture.componentInstance, 'confirmSendEmails').and.callFake(() => {
      return true;
    });

    component.fixture.componentInstance.inactiveWorkplaces = 25;
    component.fixture.detectChanges(true);
    fireEvent.click(component.getByText('Send emails', { exact: false }));

    expect(component.fixture.componentInstance.confirmSendEmails).toHaveBeenCalled();

    // const dialog = await within(document.body).findByRole('dialog');
    // const confirm = within(dialog).getByText('Are you sure you want to send these emails?');
  });
});
