import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Meta } from '@core/model/benchmarks.model';
import { Roles } from '@core/model/roles.enum';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { NewArticleListComponent } from '@features/articles/new-article-list/new-article-list.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of } from 'rxjs';

import { Establishment } from '../../../../mockdata/establishment';
import { NewDashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { NewHomeTabComponent } from './home-tab.component';

describe('NewHomeTabComponent', () => {
  const setup = async () => {
    const { fixture, getByText, queryByText, getByTestId } = await render(NewHomeTabComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        WindowRef,
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(1, Roles.Admin),
          deps: [HttpClient],
        },
      ],
      declarations: [NewDashboardHeaderComponent, NewArticleListComponent],
      componentProperties: {
        workplace: Establishment,
        meta: { workplaces: 9, staff: 4 } as Meta,
      },
      schemas: [NO_ERRORS_SCHEMA],
    });

    const component = fixture.componentInstance;

    const alertService = TestBed.inject(AlertService);
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const parentsRequestService = TestBed.inject(ParentRequestsService);

    const tabsService = TestBed.inject(TabsService);
    const tabsServiceSpy = spyOnProperty(tabsService, 'selectedTab', 'set');

    return {
      component,
      fixture,
      getByText,
      queryByText,
      getByTestId,
      alertServiceSpy,
      parentsRequestService,
      tabsServiceSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show articles list', async () => {
    const { getByTestId } = await setup();
    expect(getByTestId('article-list')).toBeTruthy();
  });

  describe('Other links', () => {
    describe('Get your ASC-WDS certificate link', () => {
      it('should render the link with the correct href', async () => {
        const { getByText } = await setup();
        const link = getByText('Get your ASC-WDS certificate');
        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual('/asc-wds-certificate');
      });
    });

    describe('Bulk upload your data', () => {
      it('should render the link with the correct href when can bulk upload is true', async () => {
        const { getByText, component, fixture } = await setup();
        component.canBulkUpload = true;
        fixture.detectChanges();
        const link = getByText('Bulk upload your data');
        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual('/bulk-upload');
      });

      it('should not render the link with the correct href when can bulk upload is false', async () => {
        const { queryByText, component, fixture } = await setup();
        component.canBulkUpload = false;
        fixture.detectChanges();
        expect(queryByText('Bulk upload your data')).toBeFalsy();
      });
    });

    describe('Does your data meet WDF requirements link', () => {
      it('should render the link with the correct href', async () => {
        const { getByText } = await setup();
        const link = getByText('Does your data meet WDF requirements?');
        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual('/wdf');
      });
    });

    describe('About ASC-WDS link', () => {
      it('should render the link with the correct href', async () => {
        const { getByText } = await setup();
        const link = getByText('About ASC-WDS');
        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual('/about-ascwds');
      });
    });

    describe('Help to get you started link', () => {
      it('should render the link with the correct href', async () => {
        const { getByText } = await setup();
        const link = getByText('Help to get you started');
        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual('/first-login-wizard');
      });
    });

    describe('Link to my parent organisation', () => {
      it('should show Link to my parent organisation pending when trying to link to a parent', async () => {
        const { component, fixture, queryByText } = await setup();

        component.workplace.isParent = false;
        component.canLinkToParent = true;
        component.linkToParentRequestedStatus = true;

        fixture.detectChanges();

        const expectedMessage = 'Link to my parent organisation pending';
        expect(queryByText(expectedMessage)).toBeTruthy();
        expect(queryByText('Link to my parent organisation')).toBeFalsy();
        expect(queryByText('Become a parent organisation')).toBeFalsy();
      });

      it('should not show Link to my parent organisation pending before requesting', async () => {
        const { component, fixture, queryByText } = await setup();

        component.workplace.isParent = false;
        component.canLinkToParent = true;
        component.canBecomeAParent = true;
        component.linkToParentRequestedStatus = false;
        component.parentStatusRequested = false;

        fixture.detectChanges();

        const expectedMessage = 'Link to my parent organisation pending';
        expect(queryByText(expectedMessage)).toBeFalsy();
        expect(queryByText('Link to my parent organisation')).toBeTruthy();
        expect(queryByText('Become a parent organisation')).toBeTruthy();
      });

      it('should show a dialog to confirm that you want become link to a parent organisation', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.isParent = false;
        component.canLinkToParent = true;
        fixture.detectChanges();

        const linkToParentLink = getByText('Link to my parent organisation');
        const dialogMessage = 'Send a request to link to your parent organisation';

        fireEvent.click(linkToParentLink);
        fixture.detectChanges();

        const dialog = await within(document.body).findByRole('dialog');

        expect(dialog).toBeTruthy();
        expect(within(dialog).getByText(dialogMessage, { exact: false })).toBeTruthy();
      });

      it('should show a dialog to confirm you want to cancel parent request when clicking on link after requesting', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.isParent = false;
        component.canLinkToParent = true;
        component.linkToParentRequestedStatus = true;
        fixture.detectChanges();

        const pendingLink = getByText('Link to my parent organisation pending');

        fireEvent.click(pendingLink);
        fixture.detectChanges();

        const dialog = await within(document.body).findByRole('dialog');
        const dialogMessage = 'Your request to link to your parent organisation is pending';

        expect(dialog).toBeTruthy();
        expect(within(dialog).getByText(dialogMessage, { exact: false })).toBeTruthy();
      });

      it('should call cancelRequestToParent() in the establishmentService and set success alert when successful', async () => {
        const { component, fixture, getByText, queryByText, alertServiceSpy } = await setup();

        component.workplace.isParent = false;
        component.canLinkToParent = true;
        component.linkToParentRequestedStatus = true;
        fixture.detectChanges();

        const returnedEstablishment = {
          requstedParentName: 'Parent name',
        };
        const establishmentService = TestBed.inject(EstablishmentService);
        const cancelBecomeAParentSpy = spyOn(establishmentService, 'cancelRequestToParentForLink').and.returnValue(
          of([returnedEstablishment]) as Establishment,
        );

        const linkToParentPendingLink = getByText('Link to my parent organisation pending');

        expect(linkToParentPendingLink).toBeTruthy();
        fireEvent.click(linkToParentPendingLink);
        fixture.detectChanges();

        const dialog = await within(document.body).findByRole('dialog');
        const cancelRequestButton = await within(dialog).getByText('Cancel request');

        fireEvent.click(cancelRequestButton);
        fixture.detectChanges();

        const becomeAParentLink = queryByText('Become a parent organisation');
        const linkToParentLink = queryByText('Link to my parent organisation');

        expect(cancelBecomeAParentSpy).toHaveBeenCalled();
        expect(alertServiceSpy).toHaveBeenCalledWith({
          type: 'success',
          message: `Request to link to ${returnedEstablishment.requstedParentName} has been cancelled.`,
        });
        expect(becomeAParentLink).toBeTruthy();
        expect(linkToParentLink).toBeTruthy();
      });
    });

    describe('Become a parent organisation', () => {
      it('should show Parent request pending when trying to become a parent', async () => {
        const { component, fixture, queryByText } = await setup();

        component.workplace.isParent = false;
        component.canBecomeAParent = true;
        component.linkToParentRequestedStatus = false;
        component.parentStatusRequested = true;
        fixture.detectChanges();

        const expectedMessage = 'Parent request pending';
        expect(queryByText(expectedMessage)).toBeTruthy();
        expect(queryByText('Link to my parent organisation')).toBeFalsy();
        expect(queryByText('Become a parent organisation')).toBeFalsy();
      });

      it('should not show Parent request pending before requesting', async () => {
        const { component, fixture, queryByText } = await setup();

        component.workplace.isParent = false;
        component.canBecomeAParent = true;
        component.linkToParentRequestedStatus = false;
        component.parentStatusRequested = false;
        component.canLinkToParent = true;
        fixture.detectChanges();

        const expectedMessage = 'Parent request pending';
        expect(queryByText(expectedMessage)).toBeFalsy();
        expect(queryByText('Link to my parent organisation')).toBeTruthy();
        expect(queryByText('Become a parent organisation')).toBeTruthy();
      });

      it('should show a dialog to confirm that you want become a parent organisation', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.isParent = false;
        component.canBecomeAParent = true;
        component.linkToParentRequestedStatus = false;
        component.parentStatusRequested = false;
        component.canLinkToParent = true;

        fixture.detectChanges();

        const becomeAParentLink = getByText('Become a parent organisation');
        const dialogMessage = 'Become a parent organisation';

        fireEvent.click(becomeAParentLink);
        fixture.detectChanges();

        const dialog = await within(document.body).findByRole('dialog');

        expect(dialog).toBeTruthy();
        expect(within(dialog).getByText(dialogMessage, { exact: false })).toBeTruthy();
      });

      it('should call becomeAParent() in the parentRequestsService and set success alert when successful', async () => {
        const { component, fixture, getByText, queryByText, alertServiceSpy, parentsRequestService } = await setup();

        component.workplace.isParent = false;
        component.canBecomeAParent = true;
        component.linkToParentRequestedStatus = false;
        component.parentStatusRequested = false;
        component.canLinkToParent = true;
        fixture.detectChanges();

        const becomeAParentSpy = spyOn(parentsRequestService, 'becomeParent').and.returnValue(of({}));

        const becomeAParentLink = getByText('Become a parent organisation');

        fireEvent.click(becomeAParentLink);
        fixture.detectChanges();

        const dialog = await within(document.body).findByRole('dialog');
        const sendRequestButton = await within(dialog).getByText('Send request');

        fireEvent.click(sendRequestButton);
        fixture.detectChanges();

        const pendingLink = queryByText('Parent request pending');
        const linkToParentLink = queryByText('Link to my parent organisation');

        expect(becomeAParentSpy).toHaveBeenCalled();
        expect(alertServiceSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Your request to become a parent organisation has been sent.',
        });
        expect(pendingLink).toBeTruthy();
        expect(linkToParentLink).toBeFalsy();
      });

      it('should show a dialog to confirm you want to cancel parent request when clicking on link after requesting', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.isParent = false;
        component.canBecomeAParent = true;
        component.linkToParentRequestedStatus = false;
        component.parentStatusRequested = true;
        fixture.detectChanges();

        const pendingLink = getByText('Parent request pending');

        fireEvent.click(pendingLink);
        fixture.detectChanges();

        const dialog = await within(document.body).findByRole('dialog');
        const dialogMessage = 'Your request to become a parent organisation is pending';

        expect(dialog).toBeTruthy();
        expect(within(dialog).getByText(dialogMessage, { exact: false })).toBeTruthy();
      });
    });

    it('should call cancelBecomeAParent() in the parentRequestsService and set success alert when successful', async () => {
      const { component, fixture, getByText, queryByText, alertServiceSpy, parentsRequestService } = await setup();

      component.workplace.isParent = false;
      component.canBecomeAParent = true;
      component.linkToParentRequestedStatus = false;
      component.parentStatusRequested = true;
      fixture.detectChanges();

      const cancelBecomeAParentSpy = spyOn(parentsRequestService, 'cancelBecomeAParent').and.returnValue(of({}));

      const parentPendingLink = getByText('Parent request pending');

      fireEvent.click(parentPendingLink);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');
      const cancelRequestButton = await within(dialog).getByText('Cancel request');

      fireEvent.click(cancelRequestButton);
      fixture.detectChanges();

      const becomeAParentLink = queryByText('Become a parent organisation');
      const linkToParentLink = queryByText('Link to my parent organisation');

      expect(cancelBecomeAParentSpy).toHaveBeenCalled();
      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Request to become a parent organisation has been cancelled.',
      });
      expect(becomeAParentLink).toBeTruthy();
      expect(linkToParentLink).toBeTruthy();
    });

    it('should link to the first login wizard page when clicking "Help to get you started"', async () => {
      const { getByText } = await setup();

      const firstLoginWizardLink = getByText('Help to get you started');
      expect(firstLoginWizardLink.getAttribute('href')).toBe('/first-login-wizard');
    });
  });

  describe('cards', () => {
    it('should show a card with a link that takes you to the benchmarks tab', async () => {
      const { getByText, tabsServiceSpy } = await setup();

      const benchmarksLink = getByText('See how you compare with other workplaces');
      fireEvent.click(benchmarksLink);

      expect(benchmarksLink).toBeTruthy();
      expect(tabsServiceSpy).toHaveBeenCalledWith('benchmarks');
    });

    it('should render the number of workplaces to compare with', async () => {
      const { getByText } = await setup();

      const text = getByText(
        'There are 9 workplaces providing the same main service as you in your local authority area.',
      );

      expect(text).toBeTruthy();
    });

    it('should show a card with a link that takes you to the benefits bundle page', async () => {
      const { getByText } = await setup();

      const benefitsBundleLink = getByText('View the ASC-WDS Benefits Bundle');

      expect(benefitsBundleLink).toBeTruthy();
      expect(benefitsBundleLink.getAttribute('href')).toBe('/benefits-bundle');
    });
  });

  describe('summary', () => {
    it('should show summary box', async () => {
      const { getByTestId } = await setup();

      const summaryBox = getByTestId('summaryBox');

      expect(summaryBox).toBeTruthy();
    });

    it('should show workplace link and take you to the workplace tab', async () => {
      const { getByText, tabsServiceSpy } = await setup();

      const workplaceLink = getByText('Workplace');
      fireEvent.click(workplaceLink);

      expect(workplaceLink).toBeTruthy();
      expect(tabsServiceSpy).toHaveBeenCalledWith('workplace');
    });

    it('should show staff records link and take you to the staff records tab', async () => {
      const { getByText, tabsServiceSpy } = await setup();

      const staffRecordsLink = getByText('Staff records');
      fireEvent.click(staffRecordsLink);

      expect(staffRecordsLink).toBeTruthy();
      expect(tabsServiceSpy).toHaveBeenCalledWith('staff-records');
    });

    it('should show training and qualifications link that take you the training and qualifications tab', async () => {
      const { getByText, tabsServiceSpy } = await setup();

      const trainingAndQualificationsLink = getByText('Training and qualifications');
      fireEvent.click(trainingAndQualificationsLink);

      expect(trainingAndQualificationsLink).toBeTruthy();
      expect(tabsServiceSpy).toHaveBeenCalledWith('training-and-qualifications');
    });
  });
});
