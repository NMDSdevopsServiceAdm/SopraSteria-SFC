import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of, throwError } from 'rxjs';

import { LastBulkUploadComponent } from './last-bulk-upload.component';

describe('LastBulkUploadComponent', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(LastBulkUploadComponent, {
      imports: [SharedModule, RouterTestingModule.withRoutes([]), HttpClientTestingModule],
      providers: [
        AlertService,
        WindowRef,
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        { provide: AuthService, useClass: MockAuthService },
        {
          provide: EstablishmentService,
          useValue: {
            primaryWorkplace: {
              uid: 'someuid',
              name: 'Care Home 1',
            },
          },
        },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            params: [],
            url: of(['testUrl']),
            snapshot: {
              data: {
                lastBulkUpload: [],
                bulkUploadLocked: { bulkUploadLockHeld: false },
              },
            },
          }),
        },
      ],
    });

    const alertService = TestBed.inject(AlertService);
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const component = fixture.componentInstance;

    return { component, fixture, getByText, alertServiceSpy };
  };

  it('should render a BulkUploadTopTipPageComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('shows the unlock bulk upload button when the locked is true', async () => {
    const { component, fixture, getByText } = await setup();

    component.locked = true;
    fixture.detectChanges();

    expect(getByText('Unlock bulk upload')).toBeTruthy();
  });

  it('should call the unlockBulkUpload method in the bulk upload service when unlocking bulk upload', async () => {
    const { component, fixture, getByText } = await setup();

    const bulkUploadService = TestBed.inject(BulkUploadService) as BulkUploadService;
    const bulkUploadServiceSpy = spyOn(bulkUploadService, 'unlockBulkUpload').and.callThrough();

    component.locked = true;
    fixture.detectChanges();

    const unlockButton = getByText('Unlock bulk upload');
    fireEvent.click(unlockButton);

    expect(bulkUploadServiceSpy).toHaveBeenCalledWith('someuid');
  });

  it('should display a success banner when the bulk upload unlock is successful', async () => {
    const { component, fixture, getByText, alertServiceSpy } = await setup();

    const bulkUploadService = TestBed.inject(BulkUploadService) as BulkUploadService;
    spyOn(bulkUploadService, 'unlockBulkUpload').and.returnValue(of(true));

    component.locked = true;
    fixture.detectChanges();

    const unlockButton = getByText('Unlock bulk upload');
    fireEvent.click(unlockButton);

    expect(alertServiceSpy).toHaveBeenCalledWith({
      type: 'success',
      message: 'Bulk upload for Care Home 1 has been successfully unlocked',
    });
  });

  it('should display a warning banner when the bulk upload unlock is unsuccessful', async () => {
    const { component, fixture, getByText, alertServiceSpy } = await setup();

    const bulkUploadService = TestBed.inject(BulkUploadService) as BulkUploadService;
    spyOn(bulkUploadService, 'unlockBulkUpload').and.returnValue(throwError('error'));

    component.locked = true;
    fixture.detectChanges();

    const unlockButton = getByText('Unlock bulk upload');
    fireEvent.click(unlockButton);

    expect(alertServiceSpy).toHaveBeenCalledWith({
      type: 'warning',
      message: 'Bulk upload for Care Home 1 failed to be unlocked',
    });
  });
});
