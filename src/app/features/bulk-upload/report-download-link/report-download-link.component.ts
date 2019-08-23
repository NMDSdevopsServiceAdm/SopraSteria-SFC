import { Component, Input } from '@angular/core';
import { ReportTypeRequestItem, ValidatedFileType } from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { saveAs } from 'file-saver';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-report-download-link',
  templateUrl: './report-download-link.component.html',
})
export class ReportDownloadLinkComponent {
  @Input() fileType: ValidatedFileType;

  constructor(private bulkUploadService: BulkUploadService, private establishmentService: EstablishmentService) {}

  public downloadReport(event: Event) {
    event.preventDefault();
    this.bulkUploadService
      .getReport(this.establishmentService.primaryWorkplace.uid, this.reportType)
      .pipe(take(1))
      .subscribe(
        response => {
          // TODO: Possibly extract this out into a helper function
          //       to get the filename from a response header
          const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const header = response.headers.get('content-disposition');
          const filenameMatches = header && header.match(filenameRegEx);
          const filename = filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
          const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });
          saveAs(blob, filename);
        },
        () => {}
      );
  }

  public get reportType() {
    const reportRequestTypeMap: { [key in ValidatedFileType]: ReportTypeRequestItem } = {
      Establishment: 'establishments',
      Training: 'training',
      Worker: 'workers',
    };
    return reportRequestTypeMap[this.fileType];
  }

  public get label() {
    const labelMap: { [key in ValidatedFileType]: string } = {
      Establishment: 'Workplace summary report',
      Training: 'Training records summary report',
      Worker: 'Staff records summary report',
    };
    return labelMap[this.fileType];
  }

  public get filename() {
    const filenameMap: { [key in ValidatedFileType]: string } = {
      Establishment: 'WorkplaceResults.txt',
      Training: 'TrainingResults.txt',
      Worker: 'StaffrecordsResults.txt',
    };
    return filenameMap[this.fileType];
  }
}
