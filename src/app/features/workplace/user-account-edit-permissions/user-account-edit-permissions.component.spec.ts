import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { UserDetails } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { EditUser } from '@core/test-utils/MockUserService';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { UserAccountEditPermissionsComponent } from './user-account-edit-permissions.component';

describe('UserAccountEditPermissionsComponent', () => {
  async function setup(user = { uid: 'abc123', role: 'Edit', canManageWdfClaims: true, isPrimary: true }) {
    const { fixture, getByText } = await render(UserAccountEditPermissionsComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule.withRoutes([{ path: 'workplace/c1231233/user/abc123/', component: DashboardComponent }]),
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        ErrorSummaryService,
        BackService,
        FormBuilder,
        AlertService,
        WindowRef,
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                user,
              },
            },
            parent: {
              snapshot: { data: { establishment: { uid: 'c1231233' } }, params: { establishmentuid: 'c131232132ab' } },
            },
          },
        },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
      ],
    });

    const injector = getTestBed();
    const userService = injector.inject(UserService) as UserService;

    const updateUserDetailsSpy = spyOn(userService, 'updateUserDetails').and.returnValue(of(EditUser() as UserDetails));

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      getByText,
      updateUserDetailsSpy,
    };
  }

  it('should render', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  describe('Permissions types (role and WDF)', () => {
    it('should call updateUserDetails with role Edit and canManageWdfClaims true when ASC-WDS edit with manage WDF claims selected', async () => {
      const { fixture, getByText, updateUserDetailsSpy } = await setup();

      await fixture.whenStable();
      fixture.detectChanges();

      const radioButton = getByText('ASC-WDS edit with manage WDF claims');
      fireEvent.click(radioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(updateUserDetailsSpy.calls.mostRecent().args[2].role).toEqual('Edit');
      expect(updateUserDetailsSpy.calls.mostRecent().args[2].canManageWdfClaims).toEqual(true);
    });

    it('should call updateUserDetails with role Edit and canManageWdfClaims false when ASC-WDS edit selected', async () => {
      const { fixture, getByText, updateUserDetailsSpy } = await setup();

      await fixture.whenStable();
      fixture.detectChanges();

      const radioButton = getByText('ASC-WDS edit');
      fireEvent.click(radioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(updateUserDetailsSpy.calls.mostRecent().args[2].role).toEqual('Edit');
      expect(updateUserDetailsSpy.calls.mostRecent().args[2].canManageWdfClaims).toEqual(false);
    });

    it('should call updateUserDetails with role Read and canManageWdfClaims true when ASC-WDS read only with manage WDF claims selected', async () => {
      const { fixture, getByText, updateUserDetailsSpy } = await setup();

      await fixture.whenStable();
      fixture.detectChanges();

      const radioButton = getByText('ASC-WDS read only with manage WDF claims');
      fireEvent.click(radioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(updateUserDetailsSpy.calls.mostRecent().args[2].role).toEqual('Read');
      expect(updateUserDetailsSpy.calls.mostRecent().args[2].canManageWdfClaims).toEqual(true);
    });

    it('should call updateUserDetails with role Read and canManageWdfClaims false when ASC-WDS read only selected', async () => {
      const { fixture, getByText, updateUserDetailsSpy } = await setup();

      await fixture.whenStable();
      fixture.detectChanges();
      const radioButton = getByText('ASC-WDS read only');
      fireEvent.click(radioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(updateUserDetailsSpy.calls.mostRecent().args[2].role).toEqual('Read');
      expect(updateUserDetailsSpy.calls.mostRecent().args[2].canManageWdfClaims).toEqual(false);
    });

    it('should call updateUserDetails with role None and canManageWdfClaims true when Manage WDF claims only selected', async () => {
      const { fixture, getByText, updateUserDetailsSpy } = await setup();

      await fixture.whenStable();
      fixture.detectChanges();

      const radioButton = getByText('Manage WDF claims only');
      fireEvent.click(radioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(updateUserDetailsSpy.calls.mostRecent().args[2].role).toEqual('None');
      expect(updateUserDetailsSpy.calls.mostRecent().args[2].canManageWdfClaims).toEqual(true);
    });
  });

  describe('Prefilling form to current user permission type', () => {
    it('should pre-fill edit with WDF radio button when user is edit role, canManageWdfClaims is true and isPrimary is true', async () => {
      const { component } = await setup();

      const form = component.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.permissionsType).toBe('ASC-WDS edit with manage WDF claims');
    });

    it('should pre-fill edit with WDF radio button when user is edit role, canManageWdfClaims is true and isPrimary is false', async () => {
      const { component } = await setup({ uid: 'abc123', role: 'Edit', canManageWdfClaims: true, isPrimary: false });

      const form = component.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.permissionsType).toBe('ASC-WDS edit with manage WDF claims');
    });

    it('should pre-fill edit with Manage WDF claims only radio button when user is none role and canManageWdfClaims is true', async () => {
      const { component } = await setup({ uid: 'abc123', role: 'None', canManageWdfClaims: true, isPrimary: false });

      const form = component.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.permissionsType).toBe('Manage WDF claims only');
    });
  });
});
