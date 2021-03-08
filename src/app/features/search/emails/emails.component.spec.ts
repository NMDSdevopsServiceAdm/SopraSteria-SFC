import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { WindowRef } from '@core/services/window.ref';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of } from 'rxjs';

import { SearchModule } from '../search.module';
import { EmailsComponent } from './emails.component';

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
    component.fixture.detectChanges();

    const numInactiveWorkplaces = component.getByTestId('inactiveWorkplaces');
    const sendEmailsButton = component.fixture.nativeElement.querySelector('button');
    expect(numInactiveWorkplaces.innerHTML).toContain('1,250');
    expect(sendEmailsButton.disabled).toBeFalsy();
  });

  it('should disable the "Send emails" button when there are no inactive workplaces', async () => {
    const component = await setup();

    component.fixture.componentInstance.inactiveWorkplaces = 0;
    component.fixture.detectChanges();

    const sendEmailsButton = component.fixture.nativeElement.querySelector('button');
    expect(sendEmailsButton.disabled).toBeTruthy();
  });

  it('should display all existing history', async () => {
    const component = await setup();

    component.fixture.componentInstance.history = [
      {
        date: '2021-01-05',
        emails: 351,
      },
      {
        date: '2020-12-05',
        emails: 772,
      },
    ];

    component.fixture.detectChanges();

    const numInactiveWorkplaces = component.getByTestId('emailCampaignHistory');
    expect(numInactiveWorkplaces.innerHTML).toContain('05/01/2021');
    expect(numInactiveWorkplaces.innerHTML).toContain('772');
    expect(numInactiveWorkplaces.innerHTML).toContain('05/12/2020');
    expect(numInactiveWorkplaces.innerHTML).toContain('351');
  });

  it('should display a message when no emails have been sent', async () => {
    const component = await setup();

    const numInactiveWorkplaces = component.getByTestId('emailCampaignHistory');
    expect(numInactiveWorkplaces.innerHTML).toContain('No emails have been sent yet.');
  });

  it('should call confirmSendEmails when the "Send emails" button is clicked', async () => {
    const component = await setup();

    component.fixture.componentInstance.inactiveWorkplaces = 25;
    component.fixture.detectChanges();

    fireEvent.click(component.getByText('Send emails', { exact: false }));

    const dialog = await within(document.body).findByRole('dialog');
    const dialogHeader = within(dialog).getByTestId('send-emails-confirmation-header');

    expect(dialogHeader).toBeTruthy();
  });

  it('should display an alert when the "Send emails" button is clicked', async () => {
    const component = await setup();

    component.fixture.componentInstance.inactiveWorkplaces = 2500;
    component.fixture.detectChanges();

    fireEvent.click(component.getByText('Send emails', { exact: false }));

    const emailCampaignService = TestBed.inject(EmailCampaignService);
    spyOn(emailCampaignService, 'createCampaign').and.returnValue(
      of({
        emails: 2500,
      }),
    );

    spyOn(emailCampaignService, 'getInactiveWorkplaces').and.returnValue(
      of({
        inactiveWorkplaces: 0,
      }),
    );

    const addAlert = spyOn(component.fixture.componentInstance.alertService, 'addAlert').and.callThrough();

    const dialog = await within(document.body).findByRole('dialog');
    within(dialog).getByText('Send emails').click();

    expect(addAlert).toHaveBeenCalledWith({
      type: 'success',
      message: '2,500 emails scheduled to be sent successfully.',
    });

    const numInactiveWorkplaces = component.getByTestId('inactiveWorkplaces');
    expect(numInactiveWorkplaces.innerHTML).toContain('0');
  });

  it('should download a report when the "Download report" button is clicked', async () => {
    const component = await setup();

    const emailCampaignService = TestBed.inject(EmailCampaignService);
    const getReport = spyOn(emailCampaignService, 'getReport').and.callFake(() => of(null));
    const saveAs = spyOn(component.fixture.componentInstance, 'saveFile').and.callFake(() => {});

    component.fixture.componentInstance.inactiveWorkplaces = 25;
    component.fixture.detectChanges();

    fireEvent.click(component.getByText('Download report', { exact: false }));

    expect(getReport).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  });
});
