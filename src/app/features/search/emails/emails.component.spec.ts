import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { ReportService } from '@core/services/report.service';
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

      fireEvent.click(component.getByText('Send emails', { exact: true }));

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

        fireEvent.click(component.getByText('Send emails', { exact: true }));

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

    it('should download a report when the "Download report" button is clicked', async () => {
      const component = await setup();

      const emailCampaignService = TestBed.inject(EmailCampaignService);
      const getReport = spyOn(emailCampaignService, 'getInactiveWorkplacesReport').and.callFake(() => of(null));
      const saveAs = spyOn(component.fixture.componentInstance, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

      component.fixture.componentInstance.inactiveWorkplaces = 25;
      component.fixture.detectChanges();

      fireEvent.click(component.getByText('Download report', { exact: false }));

      expect(getReport).toHaveBeenCalled();
      expect(saveAs).toHaveBeenCalled();
    });
  });

  describe('Targeted emails', () => {
    it('should display the total number of emails to be sent', async () => {
      const component = await setup();

      component.fixture.componentInstance.totalEmails = 1500;
      component.fixture.detectChanges();

      const numInactiveWorkplaces = component.getByTestId('totalEmails');
      expect(numInactiveWorkplaces.innerHTML).toContain('1,500');
    });

    it("should display 0 emails to be sent when the group and template haven't been selected", async () => {
      const component = await setup();

      component.fixture.componentInstance.emailGroup = null;
      component.fixture.componentInstance.selectedTemplateId = null;
      component.fixture.detectChanges();

      const numInactiveWorkplaces = component.getByTestId('totalEmails');
      expect(numInactiveWorkplaces.innerHTML).toContain('0');
    });

    it("should disable the Send emails button when the group and template haven't been selected", async () => {
      const component = await setup();

      component.fixture.componentInstance.emailGroup = '';
      component.fixture.componentInstance.selectedTemplateId = '';
      component.fixture.detectChanges();

      const sendEmailsButton = component.fixture.nativeElement.querySelectorAll('button');
      expect(sendEmailsButton[1].disabled).toBeTruthy();
    });

    it('should update the total emails when updateTotalEmails() is called', async () => {
      const component = await setup();
      const emailCampaignService = TestBed.inject(EmailCampaignService);
      const getTargetedTotalEmailsSpy = spyOn(emailCampaignService, 'getTargetedTotalEmails').and.callFake(() =>
        of({ totalEmails: 1500 }),
      );

      component.fixture.componentInstance.updateTotalEmails('primaryUsers');
      component.fixture.detectChanges();

      expect(component.fixture.componentInstance.totalEmails).toEqual(1500);
      expect(getTargetedTotalEmailsSpy).toHaveBeenCalled();
    });

    it('should display the template names as options', async () => {
      const component = await setup();
      const templates = [
        {
          id: 1,
          name: 'Template 1',
        },
        {
          id: 2,
          name: 'Template 2',
        },
      ];

      component.fixture.componentInstance.templates = templates;
      component.fixture.detectChanges();

      const templateDropdown = component.getByTestId('selectedTemplateId');

      expect(templateDropdown.childNodes[1].textContent).toEqual('Template 1');
      expect(templateDropdown.childNodes[2].textContent).toEqual('Template 2');
    });

    it('should call confirmSendEmails when the "Send emails to selected group" button is clicked', async () => {
      const component = await setup();

      component.fixture.componentInstance.totalEmails = 45;
      component.fixture.componentInstance.emailGroup = 'primaryUsers';
      component.fixture.componentInstance.selectedTemplateId = '1';
      component.fixture.detectChanges();

      fireEvent.click(component.getByText('Send emails to selected group', { exact: true }));

      const dialog = await within(document.body).findByRole('dialog');
      const dialogHeader = within(dialog).getByTestId('send-emails-confirmation-header');

      expect(dialogHeader).toBeTruthy();
    });

    [
      {
        emails: 1500,
        expectedMessage: '1,500 emails have been scheduled to be sent.',
      },
      {
        emails: 1,
        expectedMessage: '1 email has been scheduled to be sent.',
      },
    ].forEach(({ emails, expectedMessage }) => {
      it('should display an alert when the "Send emails to selected group" button is clicked', async () => {
        const component = await setup();

        component.fixture.componentInstance.totalEmails = emails;
        component.fixture.componentInstance.emailGroup = 'primaryUsers';
        component.fixture.componentInstance.selectedTemplateId = '1';
        component.fixture.detectChanges();

        fireEvent.click(component.getByText('Send emails to selected group', { exact: true }));

        const emailCampaignService = TestBed.inject(EmailCampaignService);
        spyOn(emailCampaignService, 'createTargetedEmailsCampaign').and.returnValue(
          of({
            emails,
          }),
        );

        const addAlert = spyOn(component.fixture.componentInstance.alertService, 'addAlert').and.callThrough();

        const dialog = await within(document.body).findByRole('dialog');
        within(dialog).getByText('Send emails').click();

        expect(addAlert).toHaveBeenCalledWith({
          type: 'success',
          message: expectedMessage,
        });
        component.fixture.detectChanges();
        expect(component.fixture.componentInstance.emailGroup).toEqual('');
        expect(component.fixture.componentInstance.selectedTemplateId).toEqual('');
      });
    });
  });

  describe('Reports', () => {
    it('should download a registration survey report when the "Registration survey" button is clicked', async () => {
      const component = await setup();

      const reportService = TestBed.inject(ReportService);
      const getReport = spyOn(reportService, 'getRegistrationSurveyReport').and.callFake(() => of(null));
      const saveAs = spyOn(component.fixture.componentInstance, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

      fireEvent.click(component.getByText('Registration survey', { exact: false }));

      expect(getReport).toHaveBeenCalled();
      expect(saveAs).toHaveBeenCalled();
    });

    it('should download a satisfaction survey report when the "Satisfaction survey" button is clicked', async () => {
      const component = await setup();

      const reportService = TestBed.inject(ReportService);
      const getReport = spyOn(reportService, 'getSatisfactionSurveyReport').and.callFake(() => of(null));
      const saveAs = spyOn(component.fixture.componentInstance, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

      fireEvent.click(component.getByText('Satisfaction survey', { exact: false }));

      expect(getReport).toHaveBeenCalled();
      expect(saveAs).toHaveBeenCalled();
    });

    it('should download a delete report when the "Delete report" button is clicked', async () => {
      const component = await setup();

      const reportService = TestBed.inject(ReportService);
      const getReport = spyOn(reportService, 'getDeleteReport').and.callFake(() => of(null));
      const saveAs = spyOn(component.fixture.componentInstance, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

      fireEvent.click(component.getByText('Delete report', { exact: false }));

      expect(getReport).toHaveBeenCalled();
      expect(saveAs).toHaveBeenCalled();
    });

    it('should download a local authority progress report when the "Local admin authority progress" button is clicked', async () => {
      const component = await setup();

      const reportService = TestBed.inject(ReportService);
      const getReport = spyOn(reportService, 'getLocalAuthorityAdminReport').and.callFake(() => of(null));
      const saveAs = spyOn(component.fixture.componentInstance, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

      fireEvent.click(component.getByText('Local admin authority progress', { exact: false }));

      expect(getReport).toHaveBeenCalled();
      expect(saveAs).toHaveBeenCalled();
    });

    it('should download a WDF Summary report when the "WDF Summary Report" button is clicked', async () => {
      const component = await setup();

      const reportService = TestBed.inject(ReportService);
      const getReport = spyOn(reportService, 'getWdfSummaryReport').and.callFake(() => of(null));
      const saveAs = spyOn(component.fixture.componentInstance, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

      fireEvent.click(component.getByText('WDF summary report', { exact: false }));

      expect(getReport).toHaveBeenCalled();
      expect(saveAs).toHaveBeenCalled();
    });
  });
});
