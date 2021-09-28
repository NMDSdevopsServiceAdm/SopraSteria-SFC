import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { StaffMismatchBannerComponent } from '@features/dashboard/home-tab/staff-mismatch-banner/staff-mismatch-banner.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of } from 'rxjs';

import { Establishment } from '../../../../mockdata/establishment';
import { StartComponent } from '../../workplace/start/start.component';
import { WorkplaceRoutingModule } from '../../workplace/workplace-routing.module';
import { WorkplaceModule } from '../../workplace/workplace.module';
import { HomeTabComponent } from './home-tab.component';

const MockWindow = {
  dataLayer: {
    push: () => {
      return;
    },
  },
};

describe('HomeTabComponent', () => {
  async function setup() {
    const component = await render(HomeTabComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule.withRoutes([
          { path: 'workplace/4698f4a4-ab82-4906-8b0e-3f4972375927/start', component: StartComponent },
        ]),
        WorkplaceModule,
        WorkplaceRoutingModule,
        HttpClientTestingModule,
      ],
      declarations: [HomeTabComponent, StaffMismatchBannerComponent],
      providers: [
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(1, true),
          deps: [HttpClient],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        { provide: WindowToken, useValue: MockWindow },
      ],
    });

    component.fixture.componentInstance.canEditEstablishment = true;
    component.fixture.componentInstance.workplace = Establishment;
    component.fixture.componentInstance.workplace.employerType = null;
    component.fixture.detectChanges();

    return {
      component,
    };
  }

  it('should create', async () => {
    const { component } = await setup();

    component.fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('has Add Workplace Information', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    const link = component.getByTestId('add-workplace-info');

    // Assert
    expect(link.innerHTML).toContain('Add workplace information');
    expect(link.getAttribute('href')).toContain('start');
  });
  it('Add staff banner has correct title', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.updateStaffRecords = true;
    component.fixture.detectChanges();

    const link = component.getByTestId('add-staff-banner');
    // Assert
    expect(link.innerHTML).toContain('Add staff records');
  });

  it('should not show the more staff records banner if there are equal staff records', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 10;
    component.fixture.componentInstance.workplace.numberOfStaff = 10;
    component.fixture.componentInstance.canViewListOfWorkers = true;
    component.fixture.componentInstance.workplace.eightWeeksFromFirstLogin = new Date('1970-01-01').toString();

    component.fixture.detectChanges();

    const childDebugElement = component.fixture.debugElement.query(By.directive(StaffMismatchBannerComponent));
    // Assert
    expect(childDebugElement).toBeFalsy();
  });
  it('should  show the more staff records banner if the user does  have permissions to viewListOfWorkers', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 11;
    component.fixture.componentInstance.workplace.numberOfStaff = 10;
    component.fixture.componentInstance.workplace.eightWeeksFromFirstLogin = new Date('1970-01-01').toString();

    component.fixture.componentInstance.canViewListOfWorkers = true;

    component.fixture.detectChanges();
    const childDebugElement = component.fixture.debugElement.query(By.directive(StaffMismatchBannerComponent));
    // Assert
    expect(childDebugElement).toBeTruthy();
  });

  it('should not show the more staff records banner if the user doesnt  have permissions to addWorker', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 11;
    component.fixture.componentInstance.workplace.numberOfStaff = 10;
    component.fixture.componentInstance.workplace.eightWeeksFromFirstLogin = new Date('1970-01-01').toString();

    component.fixture.componentInstance.canViewListOfWorkers = true;
    component.fixture.componentInstance.canAddWorker = false;

    component.fixture.detectChanges();
    const childDebugElement = component.fixture.debugElement.query(By.directive(StaffMismatchBannerComponent));
    // Assert
    expect(childDebugElement).toBeFalsy();
  });

  it('should not show the staff mismatch banner if no workers have been added', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 0;
    component.fixture.componentInstance.workplace.numberOfStaff = 10;
    component.fixture.componentInstance.workplace.eightWeeksFromFirstLogin = new Date('1970-01-01').toString();

    component.fixture.componentInstance.canViewListOfWorkers = true;
    component.fixture.componentInstance.canAddWorker = true;

    component.fixture.detectChanges();
    const childDebugElement = component.fixture.debugElement.query(By.directive(StaffMismatchBannerComponent));
    // Assert
    expect(childDebugElement).toBeFalsy();
  });

  it('should show the staff mismatch banner if the eight weeks date is in the past', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 12;
    component.fixture.componentInstance.workplace.numberOfStaff = 10;
    component.fixture.componentInstance.workplace.eightWeeksFromFirstLogin = new Date('1970-01-01').toString();

    component.fixture.componentInstance.canViewListOfWorkers = true;
    component.fixture.componentInstance.canAddWorker = true;

    component.fixture.detectChanges();
    const childDebugElement = component.fixture.debugElement.query(By.directive(StaffMismatchBannerComponent));
    // Assert
    expect(childDebugElement).toBeTruthy();
  });
  it('should not show the staff mismatch banner if the eight weeks date is in the future', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 12;
    component.fixture.componentInstance.workplace.numberOfStaff = 10;
    component.fixture.componentInstance.workplace.eightWeeksFromFirstLogin = new Date('2999-01-01').toString();

    component.fixture.componentInstance.canViewListOfWorkers = true;
    component.fixture.componentInstance.canAddWorker = true;

    component.fixture.detectChanges();
    const childDebugElement = component.fixture.debugElement.query(By.directive(StaffMismatchBannerComponent));
    // Assert
    expect(childDebugElement).toBeFalsy();
  });

  it('should not show the Local authority progress link when not a local authority', async () => {
    const { component } = await setup();

    expect(component.queryByText('Local authority progress')).toBeFalsy();
  });

  it('should show the Local authority progress link when it is a local authority', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.canRunLocalAuthorityReport = true;
    component.fixture.detectChanges();

    expect(component.queryAllByText('Local authority progress').length).toBe(1);
  });

  describe('Other links', () => {
    describe('Link to my parent organisation', () => {
      it('should show Link to my parent organisation pending when trying to link to a parent', async () => {
        const { component } = await setup();

        component.fixture.componentInstance.workplace.isParent = false;
        component.fixture.componentInstance.canLinkToParent = true;
        component.fixture.componentInstance.linkToParentRequestedStatus = true;

        component.fixture.detectChanges();

        const expectedMessage = 'Link to my parent organisation pending';
        expect(component.queryByText(expectedMessage)).toBeTruthy();
        expect(component.queryByText('Link to my parent organisation')).toBeFalsy();
        expect(component.queryByText('Become a parent organisation')).toBeFalsy();
      });

      it('should not show Link to my parent organisation pending before requesting', async () => {
        const { component } = await setup();

        component.fixture.componentInstance.workplace.isParent = false;
        component.fixture.componentInstance.canLinkToParent = true;
        component.fixture.componentInstance.linkToParentRequestedStatus = false;

        component.fixture.detectChanges();

        const expectedMessage = 'Link to my parent organisation pending';
        expect(component.queryByText(expectedMessage)).toBeFalsy();
        expect(component.queryByText('Link to my parent organisation')).toBeTruthy();
        expect(component.queryByText('Become a parent organisation')).toBeTruthy();
      });

      it('should show a dialog to confirm that you want become link to a parent organisation', async () => {
        const { component } = await setup();

        component.fixture.componentInstance.canLinkToParent = true;
        component.fixture.detectChanges();

        const linkToParentLink = component.getByText('Link to my parent organisation');
        const dialogMessage = 'Send a request to link to your parent organisation';

        fireEvent.click(linkToParentLink);
        component.fixture.detectChanges();

        const dialog = await within(document.body).findByRole('dialog');

        expect(dialog).toBeTruthy();
        expect(within(dialog).getByText(dialogMessage, { exact: false })).toBeTruthy();
      });

      it('should show a dialog to confirm you want to cancel parent request when clicking on link after requesting', async () => {
        const { component } = await setup();

        component.fixture.componentInstance.canLinkToParent = true;
        component.fixture.componentInstance.linkToParentRequestedStatus = true;
        component.fixture.detectChanges();

        const pendingLink = component.getByText('Link to my parent organisation pending');

        fireEvent.click(pendingLink);
        component.fixture.detectChanges();

        const dialog = await within(document.body).findByRole('dialog');
        const dialogMessage = 'Your request to link to your parent organisation is pending';

        expect(dialog).toBeTruthy();
        expect(within(dialog).getByText(dialogMessage, { exact: false })).toBeTruthy();
      });

      it('should call cancelRequestToParent() in the establishmentService and set success alert when successful', async () => {
        const { component } = await setup();

        component.fixture.componentInstance.canLinkToParent = true;
        component.fixture.componentInstance.linkToParentRequestedStatus = true;
        component.fixture.detectChanges();

        const returnedEstablishment = {
          requstedParentName: 'Parent name',
        };
        const establishmentService = TestBed.inject(EstablishmentService);
        const cancelBecomeAParentSpy = spyOn(establishmentService, 'cancelRequestToParentForLink').and.returnValue(
          of([returnedEstablishment]) as Establishment,
        );

        const alertService = TestBed.inject(AlertService);
        const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

        const linkToParentPendingLink = component.getByText('Link to my parent organisation pending');

        expect(linkToParentPendingLink).toBeTruthy();
        fireEvent.click(linkToParentPendingLink);
        component.fixture.detectChanges();

        const dialog = await within(document.body).findByRole('dialog');
        const cancelRequestButton = await within(dialog).getByText('Cancel request');

        fireEvent.click(cancelRequestButton);
        component.fixture.detectChanges();

        const becomeAParentLink = component.queryByText('Become a parent organisation');
        const linkToParentLink = component.queryByText('Link to my parent organisation');

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
        const { component } = await setup();

        component.fixture.componentInstance.workplace.isParent = false;
        component.fixture.componentInstance.canBecomeAParent = true;
        component.fixture.componentInstance.linkToParentRequestedStatus = false;
        component.fixture.componentInstance.parentStatusRequested = true;
        component.fixture.detectChanges();

        const expectedMessage = 'Parent request pending';
        expect(component.queryByText(expectedMessage)).toBeTruthy();
        expect(component.queryByText('Link to my parent organisation')).toBeFalsy();
        expect(component.queryByText('Become a parent organisation')).toBeFalsy();
      });

      it('should not show Parent request pending before requesting', async () => {
        const { component } = await setup();

        component.fixture.componentInstance.workplace.isParent = false;
        component.fixture.componentInstance.canBecomeAParent = true;
        component.fixture.componentInstance.linkToParentRequestedStatus = false;
        component.fixture.componentInstance.parentStatusRequested = false;
        component.fixture.componentInstance.canLinkToParent = true;
        component.fixture.detectChanges();

        const expectedMessage = 'Parent request pending';
        expect(component.queryByText(expectedMessage)).toBeFalsy();
        expect(component.queryByText('Link to my parent organisation')).toBeTruthy();
        expect(component.queryByText('Become a parent organisation')).toBeTruthy();
      });

      it('should show a dialog to confirm that you want become a parent organisation', async () => {
        const { component } = await setup();

        const becomeAParentLink = component.getByText('Become a parent organisation');
        const dialogMessage = 'Become a parent organisation';

        fireEvent.click(becomeAParentLink);
        component.fixture.detectChanges();

        const dialog = await within(document.body).findByRole('dialog');

        expect(dialog).toBeTruthy();
        expect(within(dialog).getByText(dialogMessage, { exact: false })).toBeTruthy();
      });

      it('should call becomeAParent() in the parentRequestsService and set success alert when successful', async () => {
        const { component } = await setup();

        const parentsRequestService = TestBed.inject(ParentRequestsService);
        const becomeAParentSpy = spyOn(parentsRequestService, 'becomeParent').and.returnValue(of({}));

        const alertService = TestBed.inject(AlertService);
        const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

        const becomeAParentLink = component.getByText('Become a parent organisation');

        fireEvent.click(becomeAParentLink);
        component.fixture.detectChanges();

        const dialog = await within(document.body).findByRole('dialog');
        const sendRequestButton = await within(dialog).getByText('Send request');

        fireEvent.click(sendRequestButton);
        component.fixture.detectChanges();

        const pendingLink = component.queryByText('Parent request pending');
        const linkToParentLink = component.queryByText('Link to my parent organisation');

        expect(becomeAParentSpy).toHaveBeenCalled();
        expect(alertServiceSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Your request to become a parent organisation has been sent.',
        });
        expect(pendingLink).toBeTruthy();
        expect(linkToParentLink).toBeFalsy();
      });

      it('should show a dialog to confirm you want to cancel parent request when clicking on link after requesting', async () => {
        const { component } = await setup();

        component.fixture.componentInstance.workplace.isParent = false;
        component.fixture.componentInstance.canBecomeAParent = true;
        component.fixture.componentInstance.linkToParentRequestedStatus = false;
        component.fixture.componentInstance.parentStatusRequested = true;
        component.fixture.detectChanges();

        const pendingLink = component.getByText('Parent request pending');

        fireEvent.click(pendingLink);
        component.fixture.detectChanges();

        const dialog = await within(document.body).findByRole('dialog');
        const dialogMessage = 'Your request to become a parent organisation is pending';

        expect(dialog).toBeTruthy();
        expect(within(dialog).getByText(dialogMessage, { exact: false })).toBeTruthy();
      });
    });

    it('should call cancelBecomeAParent() in the parentRequestsService and set success alert when successful', async () => {
      const { component } = await setup();

      component.fixture.componentInstance.workplace.isParent = false;
      component.fixture.componentInstance.canBecomeAParent = true;
      component.fixture.componentInstance.linkToParentRequestedStatus = false;
      component.fixture.componentInstance.parentStatusRequested = true;
      component.fixture.detectChanges();

      const parentsRequestService = TestBed.inject(ParentRequestsService);
      const cancelBecomeAParentSpy = spyOn(parentsRequestService, 'cancelBecomeAParent').and.returnValue(of({}));

      const alertService = TestBed.inject(AlertService);
      const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

      const parentPendingLink = component.getByText('Parent request pending');

      fireEvent.click(parentPendingLink);
      component.fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');
      const cancelRequestButton = await within(dialog).getByText('Cancel request');

      fireEvent.click(cancelRequestButton);
      component.fixture.detectChanges();

      const becomeAParentLink = component.queryByText('Become a parent organisation');
      const linkToParentLink = component.queryByText('Link to my parent organisation');

      expect(cancelBecomeAParentSpy).toHaveBeenCalled();
      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Request to become a parent organisation has been cancelled.',
      });
      expect(becomeAParentLink).toBeTruthy();
      expect(linkToParentLink).toBeTruthy();
    });
  });
});
