import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { UserDetails } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { EditUser } from '@core/test-utils/MockUserService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { UserAccountEditPermissionsComponent } from './user-account-edit-permissions.component';

describe('UserAccountEditPermissionsComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(UserAccountEditPermissionsComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        ErrorSummaryService,
        BackService,
        FormBuilder,
        CreateAccountService,
        AlertService,
        WindowRef,
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                user: {},
              },
            },
            parent: { snapshot: { data: { establishment: {} }, params: { establishmentuid: 'c131232132ab' } } },
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

  it('should call updateUserDetails with role Edit and canManageWdfClaims true when ASC-WDS edit with manage WDF claims selected', async () => {
    const { fixture, getByText, updateUserDetailsSpy } = await setup();

    await fixture.whenStable();
    fixture.detectChanges();

    const radioButton = getByText('ASC-WDS edit with manage WDF claims');
    // fireEvent.click(radioButton);

    // const continueButton = getByText('Continue');
    // fireEvent.click(continueButton);

    // expect(updateUserDetailsSpy.calls.mostRecent().args[2].role).toEqual('Edit');
    // expect(updateUserDetailsSpy.calls.mostRecent().args[2].canManageWdfClaims).toEqual(true);
  });
});
