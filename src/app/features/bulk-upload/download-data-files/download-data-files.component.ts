import { Component } from '@angular/core';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-download-data-files',
  templateUrl: './download-data-files.component.html',
})
export class DownloadDataFilesComponent {
  public BulkUploadFileType = BulkUploadFileType;
  public now: Date = new Date();

  constructor(private bulkUploadService: BulkUploadService, private establishmentService: EstablishmentService) {}

  public downloadFile(event: Event, type: BulkUploadFileType) {
    event.preventDefault();
    this.bulkUploadService
      .getDataCSV(this.establishmentService.establishmentId, type)
      .pipe(take(1))
      .subscribe(
        response => {
          // TODO: Possibly extract this out into a helper function
          //       to get the filename from a response header
          const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const filenameMatches = response.headers.get('content-disposition').match(filenameRegEx);
          const filename = filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
          const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });
          saveAs(blob, filename);
        },
        () => {}
      );
  }
}
