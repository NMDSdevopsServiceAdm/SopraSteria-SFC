import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DataChangeService } from '@core/services/data-change.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockDataChangeService } from '@core/test-utils/MockDataChangesService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { BulkUploadRelatedContentComponent } from '../bulk-upload-sidebar/bulk-upload-related-content/bulk-upload-related-content.component';
import { CodesAndGuidanceComponent } from '../codes-and-guidance/codes-and-guidance.component';
import { BulkUploadDataChangeComponent } from './data-change.component';

describe('BulkUploadDataChangeComponent', () => {
  const dataChange = MockDataChangeService.dataChangeFactory();
  const dataChangeLastUpdated = MockDataChangeService.dataChangeLastUpdatedFactory();
  async function setup() {
    const { fixture, getByText } = await render(BulkUploadDataChangeComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        WindowRef,
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: DataChangeService, useClass: MockDataChangeService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        { provide: AuthService, useClass: MockAuthService },
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
      declarations: [BulkUploadRelatedContentComponent, CodesAndGuidanceComponent],
    });

    const injector = getTestBed();
    const dataChangeService = injector.inject(DataChangeService) as DataChangeService;
    const dataChangeSpy = spyOn(dataChangeService, 'updateBUDataChangeLastUpdated');

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      dataChangeSpy,
      getByText,
    };
  }
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display title of the Data change page', async () => {
    const { getByText } = await setup();
    expect(getByText(dataChange.data.title)).toBeTruthy();
  });

  it('should display content of the Data change page', async () => {
    const { getByText } = await setup();
    expect(getByText(dataChange.data.content)).toBeTruthy();
  });

  describe('updateLastUpdatedDataChangeDate', () => {
    it('should update DataChangeLastUpdated column on updateLastUpdatedDataChangeDate', async () => {
      const { component, dataChangeSpy } = await setup();
      dataChangeSpy.and.callThrough();
      component.ngOnInit();

      const establishmentService = TestBed.inject(EstablishmentService) as EstablishmentService;
      const establishmentUid = establishmentService.primaryWorkplace.uid;

      expect(dataChangeSpy).toHaveBeenCalledWith(establishmentUid, dataChange.data.last_updated);
    });
  });
});
