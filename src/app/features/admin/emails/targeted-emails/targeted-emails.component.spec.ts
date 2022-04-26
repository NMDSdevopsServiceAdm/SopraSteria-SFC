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

import { TargetedEmailsComponent } from './targeted-emails.component';

describe('EmailsComponent', () => {
  async function setup() {
    return render(TargetedEmailsComponent, {
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, SearchModule],
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

  describe('Targeted emails', () => {
    it('should create', async () => {
      const component = await setup();
      expect(component).toBeTruthy();
    });

    it('should display the total number of emails to be sent', async () => {
      const component = await setup();

      component.fixture.componentInstance.totalEmails = 1500;
      component.fixture.detectChanges();

      const totalEmail = component.getByTestId('totalEmails');
      expect(totalEmail.innerHTML).toContain('1,500');
    });

    it('should display the total number of emails to be sent', async () => {
      const component = await setup();

      const numberOfUsersToEmail = component.getByTestId('numberOfUsersToEmail');
      expect(numberOfUsersToEmail.innerHTML).toContain('Number of users to email:');
    });

    it('should display the total number of emails to be sent', async () => {
      const component = await setup();

      component.fixture.componentInstance.totalEmails = 1500;
      component.fixture.detectChanges();

      const totalEmail = component.getByTestId('totalEmails');
      expect(totalEmail.innerHTML).toContain('1,500');
    });

    it("should display 0 emails to be sent when the group and template haven't been selected", async () => {
      const component = await setup();

      component.fixture.componentInstance.emailGroup = null;
      component.fixture.componentInstance.selectedTemplateId = null;
      component.fixture.detectChanges();

      const totalEmails = component.getByTestId('totalEmails');
      expect(totalEmails.innerHTML).toContain('0');
    });

    it("should disable the Send emails button when the group and template haven't been selected", async () => {
      const component = await setup();

      component.fixture.componentInstance.emailGroup = '';
      component.fixture.componentInstance.selectedTemplateId = '';
      component.fixture.detectChanges();

      const sendEmailsButton = component.fixture.nativeElement.querySelectorAll('button');
      expect(sendEmailsButton[0].disabled).toBeTruthy();
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

    it('should call confirmSendEmails when the "Send number of targeted email" button is clicked', async () => {
      const component = await setup();

      component.fixture.componentInstance.totalEmails = 45;
      component.fixture.componentInstance.emailGroup = 'primaryUsers';
      component.fixture.componentInstance.selectedTemplateId = '1';
      component.fixture.detectChanges();

      fireEvent.click(component.getByText('Send targeted emails', { exact: false }));

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
      it('should display an alert when the "Send targeted emails" button is clicked', async () => {
        const component = await setup();

        component.fixture.componentInstance.totalEmails = emails;
        component.fixture.componentInstance.emailGroup = 'primaryUsers';
        component.fixture.componentInstance.selectedTemplateId = '1';
        component.fixture.detectChanges();

        fireEvent.click(component.getByText('Send targeted emails', { exact: false }));

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
});
