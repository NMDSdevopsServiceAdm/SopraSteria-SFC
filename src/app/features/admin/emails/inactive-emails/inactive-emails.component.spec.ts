import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { WindowRef } from '@core/services/window.ref';
import { SearchModule } from '@features/search/search.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of } from 'rxjs';

import { InactiveEmailsComponent } from './inactive-emails.component';

describe('InactiveEmailsComponent', () => {
  async function setup() {
    return render(InactiveEmailsComponent, {
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
                inactiveWorkplaceForDeletion: { inactiveWorkplacesForDeletion: 0 },
                emailTemplates: {
                  templates: [],
                },
              },
            },
          },
        },
      ],
    });
  }

  describe('Inactive workplaces', () => {
    it('should create', async () => {
      const component = await setup();
      expect(component).toBeTruthy();
    });

    it('should display the total number of emails to be sent', async () => {
      const component = await setup();

      const numberOfInactiveWorkplacesToEmail = component.getByTestId('inactiveWorkplacesToEmail');
      expect(numberOfInactiveWorkplacesToEmail.innerHTML).toContain('Number of inactive workplaces to email:');
    });

    it('should display the total number of emails to be sent', async () => {
      const component = await setup();

      component.fixture.componentInstance.inactiveWorkplaces = 1250;
      component.fixture.detectChanges();

      const numInactiveWorkplaces = component.getByTestId('inactiveWorkplaces');
      expect(numInactiveWorkplaces.innerHTML).toContain('1,250');
    });

    it('should download a report when the "Download report" button is clicked', async () => {
      const component = await setup();

      const emailCampaignService = TestBed.inject(EmailCampaignService);
      const getReport = spyOn(emailCampaignService, 'getInactiveWorkplacesReport').and.callFake(() => of(null));
      const saveAs = spyOn(component.fixture.componentInstance, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

      component.fixture.componentInstance.inactiveWorkplaces = 25;
      component.fixture.detectChanges();

      fireEvent.click(component.getByText('Download report on inactive workplaces', { exact: false }));

      expect(getReport).toHaveBeenCalled();
      expect(saveAs).toHaveBeenCalled();
    });

    it('should display the total number of inactive workplaces', async () => {
      const component = await setup();

      component.fixture.componentInstance.inactiveWorkplaces = 1250;
      component.fixture.detectChanges();

      const numInactiveWorkplaces = component.getByTestId('inactiveWorkplaces');
      const sendEmailsButton = component.fixture.nativeElement.querySelectorAll('button');
      expect(numInactiveWorkplaces.innerHTML).toContain('1,250');
      expect(sendEmailsButton[0].disabled).toBeFalsy();
    });

    it('should disable the "Send emails" button when there are no inactive workplaces', async () => {
      const component = await setup();

      component.fixture.componentInstance.inactiveWorkplaces = 0;
      component.fixture.detectChanges();

      const sendEmailsButton = component.fixture.nativeElement.querySelectorAll('button');
      expect(sendEmailsButton[0].disabled).toBeTruthy();
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

      fireEvent.click(component.getByText('Send inactive workplace emails', { exact: false }));

      const dialog = await within(document.body).findByRole('dialog');
      const dialogHeader = within(dialog).getByTestId('send-emails-confirmation-header');

      expect(dialogHeader).toBeTruthy();
    });

    [
      {
        emails: 2500,
        expectedMessage: '2,500 emails have been scheduled to be sent.',
      },
      {
        emails: 1,
        expectedMessage: '1 email has been scheduled to be sent.',
      },
    ].forEach(({ emails, expectedMessage }) => {
      it('should display an alert when the "Send emails" button is clicked', async () => {
        const component = await setup();

        component.fixture.componentInstance.inactiveWorkplaces = 2500;
        component.fixture.detectChanges();

        fireEvent.click(component.getByText('Send inactive workplace emails', { exact: false }));

        const emailCampaignService = TestBed.inject(EmailCampaignService);
        spyOn(emailCampaignService, 'createInactiveWorkplacesCampaign').and.returnValue(
          of({
            emails,
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
          message: expectedMessage,
        });

        const numInactiveWorkplaces = component.getByTestId('inactiveWorkplaces');
        expect(numInactiveWorkplaces.innerHTML).toContain('0');
      });
    });
  });

  describe('Inactive workplaces for deletion', () => {
    it('should display the total number of Inactive workplaces to be deleted', async () => {
      const component = await setup();

      const numberOfInactiveWorkplacesForDeletion = component.getByTestId('inactiveWorkplacesToDelete');
      expect(numberOfInactiveWorkplacesForDeletion.innerHTML).toContain('Number of inactive workplaces to delete:');
    });

    it('should display the total number of emails to be sent', async () => {
      const component = await setup();

      component.fixture.componentInstance.numberOfInactiveWorkplacesForDeletion = 125;
      component.fixture.detectChanges();

      const numberOfInactiveWorkplacesToDelete = component.getByTestId('numberOfInactiveWorkplacesToDelete');
      expect(numberOfInactiveWorkplacesToDelete.innerHTML).toContain('125');
    });

    it('should disable the "Delete inactive accounts" button when there are no inactive workplaces', async () => {
      const component = await setup();

      component.fixture.componentInstance.numberOfInactiveWorkplacesForDeletion = 0;
      component.fixture.detectChanges();

      const deleteInactiveAccountsButton = component.fixture.nativeElement.querySelectorAll('button')[1];
      expect(deleteInactiveAccountsButton.disabled).toBeTruthy();
    });

    it('should call confirmDeleteInactiveAccounts when the "delete inactive accounts" button is clicked', async () => {
      const component = await setup();

      component.fixture.componentInstance.numberOfInactiveWorkplacesForDeletion = 25;
      component.fixture.detectChanges();

      fireEvent.click(component.getByText('Delete inactive accounts', { exact: false }));

      const dialog = await within(document.body).findByRole('dialog');
      const dialogHeader = within(dialog).getByTestId('delete-inactive-accounts-confirmation-header');

      expect(dialogHeader).toBeTruthy();
    });
  });
});
