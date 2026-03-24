import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { Worker } from '@core/model/worker.model';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { NewDashboardHeaderComponent } from '../../../shared/components/new-dashboard-header/dashboard-header.component';
import { NewStaffTabComponent } from './staff-tab.component';
import { NewPillWithLinkComponent } from '@shared/components/new-pill-with-link/new-pill-with-link.component';
import { of } from 'rxjs';

const MockWindow = {
  dataLayer: {
    push: () => {
      return;
    },
  },
};

describe('NewStaffTabComponent', () => {
  const setup = async (overrides: any = {}) => {
    const workerArr = overrides?.workers ?? ([workerBuilder()] as Worker[]);
    const establishment = overrides?.establishment ?? (establishmentBuilder() as Establishment);
    const role = overrides?.isAdmin ? Roles.Admin : Roles.Edit;
    const setupTools = await render(NewStaffTabComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: PermissionsService,
          useClass: MockPermissionsService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: WindowRef,
          useClass: WindowRef,
        },

        {
          provide: UserService,
          useFactory: MockUserService.factory(overrides?.subsidiaries ?? 0, role),
          deps: [HttpClient],
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(true, overrides?.isAdmin),
          deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
        },
        { provide: WindowToken, useValue: MockWindow },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      declarations: [NewDashboardHeaderComponent, NewPillWithLinkComponent],
      componentProperties: {
        workplace: { ...establishment },
        workers: workerArr as Worker[],
        workerCount: workerArr.length,
      },
    });

    const component = setupTools.fixture.componentInstance;

    const workerService = TestBed.inject(WorkerService) as WorkerService;
    const workerSpy = spyOn(workerService, 'setAddStaffRecordInProgress');

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const updateSingleFieldSpy = spyOn(establishmentService, 'updateSingleEstablishmentField').and.returnValue(
      of(null),
    );

    return {
      component,
      ...setupTools,
      workerSpy,
      routerSpy,
      updateSingleFieldSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the no staff records section if there are no staff records', async () => {
    const overrides = { workers: [], isAdmin: true, subsidiaries: 0 };
    const { getByTestId, queryByTestId } = await setup(overrides);

    expect(getByTestId('no-staff-records')).toBeTruthy();
    expect(queryByTestId('staff-records')).toBeFalsy();
  });

  it('should show the staff records section if there are staff records', async () => {
    const overrides = { isAdmin: true, subsidiaries: 0 };
    const { getByTestId, queryByTestId } = await setup(overrides);

    expect(getByTestId('staff-records')).toBeTruthy();
    expect(queryByTestId('no-staff-records')).toBeFalsy();
  });

  it('should call setAddStaffRecordInProgress when initialising component', async () => {
    const overrides = { isAdmin: true, subsidiaries: 0 };
    const { component, workerSpy } = await setup(overrides);

    component.ngOnInit();
    expect(workerSpy).toHaveBeenCalledWith(false);
  });

  describe('Update pay for multiple staff', () => {
    const workers = [workerBuilder(), workerBuilder()] as Worker[];
    const establishment = establishmentBuilder() as Establishment;
    const linkText = 'Update pay for multiple staff';

    [false, null].forEach((value) => {
      it(`should show the 'NEW' pill when updatePayForMultiStaffViewed is ${value}`, async () => {
        const overridesEstablishment = { ...establishment, updatePayForMultiStaffViewed: value };
        const overrides = { workers, isAdmin: false, subsidiaries: 0, establishment: overridesEstablishment };
        const { getByTestId } = await setup(overrides);

        expect(getByTestId('new-pill')).toBeTruthy();
      });
    });

    it("should not show the 'NEW' pill when updatePayForMultiStaffViewed is true", async () => {
      const workers = [workerBuilder(), workerBuilder()] as Worker[];
      const overridesEstablishment = { ...establishment, updatePayForMultiStaffViewed: true };
      const overrides = { workers, isAdmin: false, subsidiaries: 0, establishment: overridesEstablishment };
      const { queryByTestId } = await setup(overrides);

      expect(queryByTestId('new-pill')).toBeFalsy();
    });

    it('should show the link when there is more than 1 staff', async () => {
      const workers = [workerBuilder(), workerBuilder()] as Worker[];
      const overrides = { workers, isAdmin: true, subsidiaries: 0 };
      const { getByText } = await setup(overrides);

      expect(getByText(linkText)).toBeTruthy();
    });

    it('should not show the link when there is no staff', async () => {
      const overrides = { workers: [], isAdmin: true, subsidiaries: 0 };
      const { queryByText } = await setup(overrides);

      expect(queryByText(linkText)).toBeFalsy();
    });

    it('should not show the link when there is only 1 staff', async () => {
      const workers = [workerBuilder()] as Worker[];
      const overrides = { workers, isAdmin: true, subsidiaries: 0 };
      const { queryByText } = await setup(overrides);

      expect(queryByText(linkText)).toBeFalsy();
    });

    it('should navigate to the update-pay-multiple-staff page', async () => {
      const workers = [workerBuilder(), workerBuilder()] as Worker[];
      const overridesEstablishment = { ...establishment, updatePayForMultiStaffViewed: true };
      const overrides = { workers, isAdmin: true, subsidiaries: 0, establishment: overridesEstablishment };
      const { fixture, getByText, routerSpy } = await setup(overrides);

      const link = getByText(linkText);
      fireEvent.click(link);
      fixture.autoDetectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['workplace', establishment.uid, 'update-pay-multiple-staff']);
    });

    [false, null].forEach((value) => {
      it(`should call updateSingleEstablishmentField if updatePayForMultiStaffViewed is ${value}`, async () => {
        const workers = [workerBuilder(), workerBuilder()] as Worker[];
        const overridesEstablishment = { ...establishment, updatePayForMultiStaffViewed: value };
        const overrides = { workers, isAdmin: false, subsidiaries: 0, establishment: overridesEstablishment };
        const { fixture, getByText, updateSingleFieldSpy } = await setup(overrides);

        const link = getByText(linkText);
        fireEvent.click(link);
        fixture.autoDetectChanges();

        expect(updateSingleFieldSpy).toHaveBeenCalledWith(overridesEstablishment.uid, {
          property: 'updatePayForMultiStaffViewed',
          value: true,
        });
      });
    });

    it('should not call updateSingleEstablishmentField if updatePayForMultiStaffViewed is true', async () => {
      const workers = [workerBuilder(), workerBuilder()] as Worker[];
      const overridesEstablishment = { ...establishment, updatePayForMultiStaffViewed: true };
      const overrides = { workers, isAdmin: false, subsidiaries: 0, establishment: overridesEstablishment };
      const { fixture, getByText, updateSingleFieldSpy } = await setup(overrides);

      const link = getByText(linkText);
      fireEvent.click(link);
      fixture.autoDetectChanges();

      expect(updateSingleFieldSpy).not.toHaveBeenCalled();
    });
  });
});
