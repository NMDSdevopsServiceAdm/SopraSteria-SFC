import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { Workplace } from '../../../core/model/my-workplaces.model';
import { EstablishmentService } from '../../../core/services/establishment.service';
import { MockParentSubsidiaryViewService } from '../../../core/test-utils/MockParentSubsidiaryViewService';
import { workplaceBuilder } from '../../../core/test-utils/MockUserService';
import { WorkplaceInfoPanelComponent } from './workplace-info-panel.component';
import { DialogService } from '@core/services/dialog.service';
import { CancelDataOwnerDialogComponent } from '@shared/components/cancel-data-owner-dialog/cancel-data-owner-dialog.component';
import { AlertService } from '@core/services/alert.service';
import { of } from 'rxjs';
import { CancelOwnerShip, Establishment } from '@core/model/establishment.model';

describe('workplace-info-panel', () => {
  const establishment = workplaceBuilder() as Workplace;
  const setup = async (overrides: any = {}) => {
    const isAdmin = overrides?.isAdmin ? true : false;

    const subWorkplace = { ...establishment, ...overrides?.workplace };

    const setupTools = await render(WorkplaceInfoPanelComponent, {
      imports: [RouterModule, SharedModule],
      declarations: [CancelDataOwnerDialogComponent],
      providers: [
        WindowRef,
        DialogService,
        AlertService,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory({
            primaryWorkplace: overrides.primaryWorkplace,
          }),
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(overrides.permissions ?? ['canViewEstablishment']),
        },
        {
          provide: UserService,
          useClass: MockUserService,
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(true, isAdmin),
          deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: ParentSubsidiaryViewService,
          useClass: MockParentSubsidiaryViewService,
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      componentProperties: {
        workplace: subWorkplace,
        subWorkplaceNumber: 1,
      },
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const changeOwnershipDetailsSpy = spyOn(establishmentService, 'changeOwnershipDetails');
    const cancelOwnershipSpy = spyOn(establishmentService, 'cancelOwnership').and.returnValue(of({} as Establishment));
    const alertService = injector.inject(AlertService) as AlertService;
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      ...setupTools,
      component,
      routerSpy,
      changeOwnershipDetailsSpy,
      cancelOwnershipSpy,
      alertServiceSpy,
      establishmentService,
    };
  };

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('workplace name link', () => {
    it('should show a link of the workplace name, which links to the subsidiary workplace', async () => {
      const { fixture, routerSpy, getByRole, establishmentService } = await setup();

      spyOn(establishmentService, 'getEstablishment').and.returnValue(
        of({
          employerType: {
            value: 'Local Authority (generic/other)',
          },
        }),
      );

      const workplaceLink = getByRole('link', { name: establishment.name });
      userEvent.click(workplaceLink);

      await fixture.whenStable();

      expect(routerSpy).toHaveBeenCalledWith(['/subsidiary', establishment.uid, 'home']);
    });

    it('should links to the type-of-employer question instead, if the employerType was not answered', async () => {
      const { fixture, routerSpy, getByRole, establishmentService } = await setup();

      spyOn(establishmentService, 'getEstablishment').and.returnValue(
        of({
          employerType: undefined,
        }),
      );

      const workplaceLink = getByRole('link', { name: establishment.name });
      userEvent.click(workplaceLink);

      await fixture.whenStable();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        establishment.uid,
        'workplace-data',
        'workplace-summary',
        'type-of-employer',
      ]);
    });
  });

  describe('attention needed flag', () => {
    it('should not show flag if showFlag property is false', async () => {
      const { queryByTestId } = await setup({
        workplace: {
          showFlag: false,
        },
      });

      expect(queryByTestId('red-flag')).toBeFalsy();
    });

    it('should show flag if showFlag property is true', async () => {
      const { queryByTestId, getByText, queryByText } = await setup({
        workplace: {
          showFlag: true,
        },
      });

      expect(queryByTestId('red-flag')).toBeTruthy();
      expect(getByText('Check this workplace'));
    });

    describe('Check this workplace', () => {
      it('should have a clickable link when data owner is "Parent" and permissions are not "linked only"', async () => {
        const { getByText } = await setup({
          workplace: {
            showFlag: true,
            dataPermissions: 'Workplace and Staff',
            dataOwner: 'Parent',
          },
        });

        const checkWorkplaceLink = getByText('Check this workplace');

        expect(checkWorkplaceLink.nodeName).toBe('A');
      });

      it('should have a clickable link when data owner is "Parent" and permissions are "linked only"', async () => {
        const { getByText } = await setup({
          workplace: {
            showFlag: true,
            dataPermissions: 'None',
            dataOwner: 'Parent',
          },
        });

        const checkWorkplaceLink = getByText('Check this workplace');

        expect(checkWorkplaceLink.nodeName).toBe('A');
      });

      it('should not have a clickable link when data owner is "Workplace" and permissions are "linked only"', async () => {
        const { getByText } = await setup({
          workplace: {
            showFlag: true,
            dataPermissions: 'None',
            dataOwner: 'Workplace',
          },
        });

        const checkWorkplaceText = getByText('Check this workplace');

        expect(checkWorkplaceText.nodeName).not.toBe('A');
      });

      it('should have a clickable link when data owner is "Workplace" but permissions are not "linked only"', async () => {
        const { getByText } = await setup({
          workplace: {
            showFlag: true,
            dataPermissions: 'Workplace and Staff',
            dataOwner: 'Workplace',
          },
        });

        const checkWorkplaceLink = getByText('Check this workplace');

        expect(checkWorkplaceLink.nodeName).toBe('A');
      });

      it('should link to the subsidiary workplace', async () => {
        const { fixture, routerSpy, getByText, establishmentService } = await setup({
          workplace: {
            showFlag: true,
            dataPermissions: 'Workplace and Staff',
            dataOwner: 'Workplace',
          },
        });

        spyOn(establishmentService, 'getEstablishment').and.returnValue(
          of({
            employerType: {
              value: 'Local Authority (generic/other)',
            },
          }),
        );

        const checkWorkplaceLink = getByText('Check this workplace');
        userEvent.click(checkWorkplaceLink);

        await fixture.whenStable();

        expect(routerSpy).toHaveBeenCalledWith(['/subsidiary', establishment.uid, 'home']);
      });

      it('should link to the type-of-employer question instead, if the employerType was not answered', async () => {
        const { fixture, routerSpy, getByText, establishmentService } = await setup({
          workplace: {
            showFlag: true,
            dataPermissions: 'Workplace and Staff',
            dataOwner: 'Workplace',
          },
        });

        spyOn(establishmentService, 'getEstablishment').and.returnValue(
          of({
            employerType: undefined,
          }),
        );

        const checkWorkplaceLink = getByText('Check this workplace');
        userEvent.click(checkWorkplaceLink);

        await fixture.whenStable();

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          establishment.uid,
          'workplace-data',
          'workplace-summary',
          'type-of-employer',
        ]);
      });
    });
  });

  describe('Move workplace link', () => {
    it('should display Move workplace link if user is admin', async () => {
      const { getByText } = await setup({
        isAdmin: true,
      });

      expect(getByText('Move workplace')).toBeTruthy();
    });

    it('should not display Move workplace link if user is not admin', async () => {
      const { queryByText } = await setup({
        isAdmin: false,
      });

      expect(queryByText('Move workplace')).toBeFalsy();
    });

    it('should still display Move workplace link if user is admin and workplace has Check this workplace flag', async () => {
      const { getByText, queryByTestId } = await setup({
        isAdmin: true,
        workplace: {
          showFlag: true,
        },
      });

      expect(getByText('Move workplace')).toBeTruthy();
      expect(queryByTestId('red-flag')).toBeTruthy();
      expect(getByText('Check this workplace'));
    });
  });

  describe('Data permissions links', () => {
    it('should display Change data owner link if workplace is data owner and parent has permission to change permissions for sub', async () => {
      const workplace = {
        dataOwner: 'Workplace',
        uid: 'abc123456',
      };
      const { getByText, routerSpy } = await setup({
        primaryWorkplace: { isParent: true },
        workplace,
        permissions: ['canViewEstablishment', 'canChangePermissionsForSubsidiary', 'canEditEstablishment'],
      });

      const changeDataOwnerLink = getByText('Change data owner');
      userEvent.click(changeDataOwnerLink);

      expect(routerSpy).toHaveBeenCalledWith(['/workplace/change-data-owner'], {
        queryParams: { changeDataOwnerFrom: workplace.uid },
      });
    });

    it('should not display Change data owner link if workplace is data owner, canEditEstablishment is false but parent has permission to change permissions for sub', async () => {
      const workplace = {
        dataOwner: 'Workplace',
        uid: 'abc123456',
      };
      const { queryByText } = await setup({
        primaryWorkplace: { isParent: true },
        workplace,
        permissions: ['canViewEstablishment', 'canChangePermissionsForSubsidiary'],
      });

      const changeDataOwnerLink = queryByText('Change data owner');

      expect(changeDataOwnerLink).toBeFalsy();
    });

    describe('data request pending', () => {
      const workplace = {
        dataOwner: 'Workplace',
        dataOwnershipRequested: '2025-11-27T12:38:16.132Z',
        dataPermissions: 'Workplace',
        ownershipChangeRequestId: ['request-id'],
        id: 'some-id',
        uid: 'some-id',
      };

      const requestDetails = [
        {
          approvalStatus: 'REQUESTED',
          createdByUserUID: 'mocked-uid',
          ownerChangeRequestUID: workplace.ownershipChangeRequestId[0],
          subEstablishmentID: workplace.id,
        },
      ];

      it('should display message if dataOwnershipRequested is true', async () => {
        const { getByText } = await setup({
          primaryWorkplace: { isParent: true },
          workplace: workplace,
          permissions: ['canViewEstablishment', 'canChangePermissionsForSubsidiary', 'canEditEstablishment'],
        });

        const dataRequestPendingLink = getByText('Data request pending');

        expect(dataRequestPendingLink).toBeTruthy();
      });

      it('should open dialog when "Data request pending is clicked"', async () => {
        const { getByText, fixture, changeOwnershipDetailsSpy } = await setup({
          primaryWorkplace: { isParent: true },
          workplace: workplace,
          permissions: ['canViewEstablishment', 'canChangePermissionsForSubsidiary', 'canEditEstablishment'],
        });

        changeOwnershipDetailsSpy.and.returnValue(of(requestDetails));

        const dataRequestPendingLink = getByText('Data request pending');
        fireEvent.click(dataRequestPendingLink);
        fixture.detectChanges();

        const dialog = await within(document.body).findByRole('dialog');

        expect(dialog.textContent).toContain('Your request to change ownership of data is pending');
        expect(dialog.textContent).toContain('Cancel');
        expect(dialog.textContent).toContain('Cancel data owner request');
      });

      it('should close the dialog when the "Cancel" link is clicked', async () => {
        const { getByText, fixture, changeOwnershipDetailsSpy } = await setup({
          primaryWorkplace: { isParent: true },
          workplace: workplace,
          permissions: ['canViewEstablishment', 'canChangePermissionsForSubsidiary', 'canEditEstablishment'],
        });

        changeOwnershipDetailsSpy.and.returnValue(of(requestDetails));

        const dataRequestPendingLink = getByText('Data request pending');
        fireEvent.click(dataRequestPendingLink);
        fixture.detectChanges();

        const dialog = await within(document.body).findByRole('dialog');
        const cancelLink = within(dialog).getByText('Cancel');

        fireEvent.click(cancelLink);
        fixture.detectChanges();

        expect(within(document.body).queryByRole('dialog')).toBeFalsy();
      });

      it('should call cancelOwnership() to cancel the request when the "Cancel data owner request" clicked', async () => {
        const { component, getByText, fixture, changeOwnershipDetailsSpy, cancelOwnershipSpy, alertServiceSpy } =
          await setup({
            primaryWorkplace: { isParent: true },
            workplace: workplace,
            permissions: ['canViewEstablishment', 'canChangePermissionsForSubsidiary', 'canEditEstablishment'],
          });

        changeOwnershipDetailsSpy.and.returnValue(of(requestDetails));

        const dataRequestPendingLink = getByText('Data request pending');
        fireEvent.click(dataRequestPendingLink);
        fixture.detectChanges();

        const dialog = await within(document.body).findByRole('dialog');
        const cancelDataOwnerRequestButton = within(dialog).getByText('Cancel data owner request');

        fireEvent.click(cancelDataOwnerRequestButton);
        fixture.detectChanges();

        expect(cancelOwnershipSpy).toHaveBeenCalledWith(workplace.id, workplace.ownershipChangeRequestId[0], {
          approvalStatus: 'CANCELLED',
          notificationRecipientUid: component.primaryWorkplace.uid,
        } as CancelOwnerShip);
        expect(within(document.body).queryByRole('dialog')).toBeFalsy();
        expect(alertServiceSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Request to change data owner has been cancelled ',
        });
      });
    });

    it('should display "Change data permissions" if they are a parent and data owner', async () => {
      const workplace = {
        dataOwner: 'Parent',
        uid: 'sub-uuid',
      };

      const { getByText, routerSpy } = await setup({
        primaryWorkplace: { isParent: true },
        workplace,
        permissions: ['canViewEstablishment', 'canChangePermissionsForSubsidiary', 'canEditEstablishment'],
      });

      const changeDataPermissionsLink = getByText('Change data permissions');
      userEvent.click(changeDataPermissionsLink);

      expect(changeDataPermissionsLink).toBeTruthy();
      expect(routerSpy).toHaveBeenCalledWith(['/workplace/change-data-permissions'], {
        queryParams: { changeDataPermissionsFor: workplace.uid },
      });
    });
  });
});
