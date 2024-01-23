import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockBulkUploadService } from '@core/test-utils/MockBulkUploadService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { BulkUploadModule } from '@features/bulk-upload/bulk-upload.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { BulkUploadDownloadCurrentDataComponent } from './bulk-upload-download-current-data.component';

describe('BulkUploadDownloadCurrentDataComponent', () => {
  let establishmentId;

  const setup = async (sanitise = true) => {
    const { fixture, getByText, getByTestId } = await render(BulkUploadDownloadCurrentDataComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, SharedModule, BulkUploadModule],
      providers: [
        {
          provider: BulkUploadService,
          useClass: MockBulkUploadService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
      componentProperties: {
        sanitise,
      },
    });
    const component = fixture.componentInstance;

    const bulkUploadService = TestBed.inject(BulkUploadService) as BulkUploadService;
    const bulkUploadSpy = spyOn(bulkUploadService, 'getDataCSV').and.callThrough();

    const establishmentService = TestBed.inject(EstablishmentService) as EstablishmentService;
    establishmentId = establishmentService.establishmentId;

    return { component, fixture, getByText, getByTestId, bulkUploadSpy };
  };

  it('should render a BulkUploadDownloadCurrentDataComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the links to download the csvs', async () => {
    const { getByText } = await setup();

    expect(getByText('Workplace')).toBeTruthy();
    expect(getByText('Staff')).toBeTruthy();
    expect(getByText('Training')).toBeTruthy();
  });

  it('should call getDataCSV with BulkUploadType.Establishment, when workplace link is clicked', async () => {
    const { fixture, getByText, bulkUploadSpy } = await setup();

    const workplaceLink = getByText('Workplace');

    fireEvent.click(workplaceLink);
    fixture.detectChanges();

    expect(bulkUploadSpy).toHaveBeenCalledWith(establishmentId, BulkUploadFileType.Establishment);
  });

  it('should call getDataCSV with BulkUploadType.Worker, when staff link is clicked and the sanitise is set to false', async () => {
    const { fixture, getByText, bulkUploadSpy } = await setup(false);

    const staffLink = getByText('Staff');

    fireEvent.click(staffLink);
    fixture.detectChanges();

    expect(bulkUploadSpy).toHaveBeenCalledWith(establishmentId, BulkUploadFileType.Worker);
  });

  it('should call getDataCSV with BulkUploadType.WorkerSanitise, when staff link is clicked and sanitise is set to true', async () => {
    const { fixture, getByText, bulkUploadSpy } = await setup();

    const staffLink = getByText('Staff');

    fireEvent.click(staffLink);
    fixture.detectChanges();

    expect(bulkUploadSpy).toHaveBeenCalledWith(establishmentId, BulkUploadFileType.WorkerSanitise);
  });

  it('should call getDataCSV with BulkUploadType.Training, when training link is clicked', async () => {
    const { fixture, getByText, bulkUploadSpy } = await setup();

    const trainingLink = getByText('Training');

    fireEvent.click(trainingLink);
    fixture.detectChanges();

    expect(bulkUploadSpy).toHaveBeenCalledWith(establishmentId, BulkUploadFileType.Training);
  });
});
