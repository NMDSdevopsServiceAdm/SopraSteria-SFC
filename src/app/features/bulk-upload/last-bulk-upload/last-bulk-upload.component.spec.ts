import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
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

import { BulkUploadSanitiseDataCheckboxComponent } from '../bulk-upload-sidebar/bulk-upload-sanitise-data-checkbox/bulk-upload-sanitise-data-checkbox.component';
import { LastBulkUploadComponent } from './last-bulk-upload.component';

describe('LastBulkUploadComponent', () => {
  const files = [
    {
      data: {
        fileType: 'Worker',
        records: 3,
        filename: '2022-01-01-sfc-bu-staff.csv',
        key: '1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv',
      },
      username: 'someUser',
      lastModified: '01/01/2022',
    },
    {
      data: {
        fileType: 'Establishment',
        records: 1,
        filename: '2022-01-01-sfc-bu-workplace.csv',
        key: '1/lastBulkUpload/2022-01-01-sfc-bu-workplace.csv',
      },
      username: 'someUser',
      lastModified: '01/01/2022',
    },
    {
      data: {
        fileType: 'Training',
        records: 6,
        filename: '2022-01-01-sfc-bu-training.csv',
        key: '1/lastBulkUpload/2022-01-01-sfc-bu-training.csv',
      },
      username: 'someUser',
      lastModified: '01/01/2022',
    },
  ];

  const setup = async () => {
    const { fixture, getByText, getByTestId } = await render(LastBulkUploadComponent, {
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
                lastBulkUpload: files,
                bulkUploadLocked: { bulkUploadLockHeld: false },
              },
            },
          }),
        },
      ],
      declarations: [BulkUploadSanitiseDataCheckboxComponent],
    });

    const alertService = TestBed.inject(AlertService);
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const bulkUploadService = TestBed.inject(BulkUploadService);
    const uploadFromS3Spy = spyOn(bulkUploadService, 'getUploadedFileFromS3').and.callThrough();

    const component = fixture.componentInstance;

    return { component, fixture, getByText, getByTestId, alertServiceSpy, bulkUploadService, uploadFromS3Spy };
  };

  it('should render a BulkUploadTopTipPageComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show entries in the table for the files', async () => {
    const { getByTestId } = await setup();
    expect(getByTestId(`link-2022-01-01-sfc-bu-staff.csv`)).toBeTruthy();
    expect(getByTestId(`link-2022-01-01-sfc-bu-workplace.csv`)).toBeTruthy();
    expect(getByTestId(`link-2022-01-01-sfc-bu-training.csv`)).toBeTruthy();
  });

  it('should show the sanitise data checkbox', async () => {
    const { getByTestId } = await setup();
    expect(getByTestId('showDataCheckbox')).toBeTruthy();
  });

  it('should set sanitise variable to true, when an admin loads the page', async () => {
    const { component } = await setup();
    expect(component.sanitise).toBeTruthy();
  });

  it('should change the value of sanitise to false when checkbox is checked', async () => {
    const { component, fixture, getByTestId } = await setup();
    const checkbox = getByTestId('showDataCheckbox');

    fireEvent.click(checkbox);
    fixture.detectChanges();

    expect(component.sanitise).toBeFalsy();
  });

  it('should change the value of sanitise to false when checkbox is unchecked', async () => {
    const { component, fixture, getByTestId } = await setup();
    const checkbox = getByTestId('showDataCheckbox');

    fireEvent.click(checkbox);
    fixture.detectChanges();

    fireEvent.click(checkbox);
    fixture.detectChanges();

    expect(component.sanitise).toBeTruthy();
  });

  it('should call getUploadedFileFromS3 with the StaffSanitise file type when the staff link is clicked and the checkbox is unchecked', async () => {
    const { getByTestId, fixture, uploadFromS3Spy } = await setup();

    const staffLink = getByTestId(`link-2022-01-01-sfc-bu-staff.csv`);

    fireEvent.click(staffLink);
    fixture.detectChanges();

    expect(uploadFromS3Spy).toHaveBeenCalledWith(
      'someuid',
      '1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv',
      BulkUploadFileType.WorkerSanitise,
    );
  });

  it('should call getUploadedFileFromS3 with the Stafffile type when the staff link is clicked and the checkbox is checked', async () => {
    const { getByTestId, fixture, uploadFromS3Spy } = await setup();

    const checkbox = getByTestId('showDataCheckbox');

    fireEvent.click(checkbox);
    fixture.detectChanges();

    const staffLink = getByTestId(`link-2022-01-01-sfc-bu-staff.csv`);

    fireEvent.click(staffLink);
    fixture.detectChanges();

    expect(uploadFromS3Spy).toHaveBeenCalledWith(
      'someuid',
      '1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv',
      BulkUploadFileType.Worker,
    );
  });

  it('should call getUploadedFileFromS3 with the Workplace file type when the workplace link is clicked', async () => {
    const { getByTestId, fixture, uploadFromS3Spy } = await setup();

    const staffLink = getByTestId(`link-2022-01-01-sfc-bu-workplace.csv`);

    fireEvent.click(staffLink);
    fixture.detectChanges();

    expect(uploadFromS3Spy).toHaveBeenCalledWith(
      'someuid',
      '1/lastBulkUpload/2022-01-01-sfc-bu-workplace.csv',
      BulkUploadFileType.Establishment,
    );
  });

  it('should call getUploadedFileFromS3 with the Training file type when the training link is clicked', async () => {
    const { getByTestId, fixture, uploadFromS3Spy } = await setup();

    const staffLink = getByTestId(`link-2022-01-01-sfc-bu-training.csv`);

    fireEvent.click(staffLink);
    fixture.detectChanges();

    expect(uploadFromS3Spy).toHaveBeenCalledWith(
      'someuid',
      '1/lastBulkUpload/2022-01-01-sfc-bu-training.csv',
      BulkUploadFileType.Training,
    );
  });

  it('shows the unlock bulk upload button when the locked is true', async () => {
    const { component, fixture, getByText } = await setup();

    component.locked = true;
    fixture.detectChanges();

    expect(getByText('Unlock bulk upload')).toBeTruthy();
  });

  it('should call the unlockBulkUpload method in the bulk upload service when unlocking bulk upload', async () => {
    const { component, fixture, getByText, bulkUploadService } = await setup();

    const bulkUploadServiceSpy = spyOn(bulkUploadService, 'unlockBulkUpload').and.callThrough();

    component.locked = true;
    fixture.detectChanges();

    const unlockButton = getByText('Unlock bulk upload');
    fireEvent.click(unlockButton);

    expect(bulkUploadServiceSpy).toHaveBeenCalledWith('someuid');
  });

  it('should display a success banner when the bulk upload unlock is successful', async () => {
    const { component, fixture, getByText, alertServiceSpy, bulkUploadService } = await setup();

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
    const { component, fixture, getByText, alertServiceSpy, bulkUploadService } = await setup();

    spyOn(bulkUploadService, 'unlockBulkUpload').and.returnValue(throwError('error'));

    component.locked = true;
    fixture.detectChanges();

    const unlockButton = getByText('Unlock bulk upload');
    fireEvent.click(unlockButton);

    expect(alertServiceSpy).toHaveBeenCalledWith({
      type: 'warning',
      message: 'Bulk upload for Care Home 1 failed to unlock',
    });
  });
});
