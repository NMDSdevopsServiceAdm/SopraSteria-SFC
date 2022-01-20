import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockBulkUploadService } from '@core/test-utils/MockBulkUploadService';
import { MockDataChangeService } from '@core/test-utils/MockDataChangesService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { BulkUploadMissingPageComponent } from '@features/bulk-upload/bulk-upload-missing/bulk-upload-missing-page.component';
import { BulkUploadModule } from '@features/bulk-upload/bulk-upload.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AdminSkipService } from '../admin-skip.service';

describe('BulkUploadMissingPageComponent', () => {
  const dataChange = MockDataChangeService.dataChangeFactory();
  const dataChangeLastUpdated = MockDataChangeService.dataChangeLastUpdatedFactory();
  async function setup() {
    const component = await render(BulkUploadMissingPageComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, BulkUploadModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: BulkUploadService,
          useClass: MockBulkUploadService,
        },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        AdminSkipService,
        BackService,
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              data: {
                dataChange,
                dataChangeLastUpdated,
              },
            },
          }),
        },
      ],
    });

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router) as Router;
    const componentInstance = component.fixture.componentInstance;
    return {
      component,
      establishmentService,
      router,
      componentInstance,
    };
  }

  it('should render a BulkUploadMissingPageComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show pluralized workplace and staff when multiple', async () => {
    const { component, componentInstance } = await setup();

    componentInstance.missingRefCount = {
      establishment: 2,
      worker: 2,
    };
    component.fixture.detectChanges();
    const para = component.getByTestId('info');
    expect(para.innerText).toContain('You still need to add 2 workplace references and 2 staff references.');
  });
  it('should show singular workplace  when multiple', async () => {
    const { component, componentInstance } = await setup();

    componentInstance.missingRefCount = {
      establishment: 1,
      worker: 1,
    };
    component.fixture.detectChanges();
    const para = component.getByTestId('info');
    expect(para.innerText).toContain('You still need to add 1 workplace reference and 1 staff reference.');
  });

  it('should not show workplace when 0 ', async () => {
    const { component, componentInstance } = await setup();

    componentInstance.missingRefCount = {
      establishment: 0,
      worker: 2,
    };
    component.fixture.detectChanges();
    const para = component.getByTestId('info');
    expect(para.innerText).toContain('You still need to add 2 staff references.');
  });
  it('should not show staff when 0 ', async () => {
    const { component, componentInstance } = await setup();

    componentInstance.missingRefCount = {
      establishment: 2,
      worker: 0,
    };
    component.fixture.detectChanges();
    const para = component.getByTestId('info');
    expect(para.innerText).toContain('You still need to add 2 workplace references.');
  });
});
