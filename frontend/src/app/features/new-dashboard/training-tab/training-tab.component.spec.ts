import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockRouter } from '@core/test-utils/MockRouter';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { NewTrainingTabComponent } from './training-tab.component';

describe('NewTrainingTabComponent', () => {
  const setup = async (override: any = {}) => {
    const workers = override?.withWorkers ? ([workerBuilder(), workerBuilder()] as Worker[]) : [];
    const totalRecords = override?.totalRecords ?? 4;
    const establishment = establishmentBuilder() as Establishment;
    const permissions = override.permissions ?? ['canEditWorker'];

    const routerSpy = jasmine.createSpy().and.returnValue(Promise.resolve(true));

    const setupTools = await render(NewTrainingTabComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        WindowRef,
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions),
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        { provide: Router, useFactory: MockRouter.factory({ navigate: routerSpy }) },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      componentProperties: {
        workplace: establishment,
        trainingCounts: {
          totalRecords,
        } as TrainingCounts,
        workers: workers,
        workerCount: workers.length,
      },
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const alertService = injector.inject(AlertService);
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();
    const tabsService = injector.inject(TabsService);

    return {
      ...setupTools,
      component,
      alertSpy,
      tabsService,
      routerSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should redirect to "Manage training and qualification records" page if user has no edit right', async () => {
    const { routerSpy } = await setup({
      withWorkers: true,
      totalRecords: 4,
      permissions: ['canViewWorker'],
    });
    expect(routerSpy).toHaveBeenCalled();
  });
});
