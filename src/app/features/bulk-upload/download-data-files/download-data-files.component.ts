import { Component } from '@angular/core';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { saveAs } from 'file-saver';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-download-data-files',
  templateUrl: './download-data-files.component.html',
})
export class DownloadDataFilesComponent {
  public lastUpdated = new Date();
  public BulkUploadFileType = BulkUploadFileType;

  constructor(private bulkUploadService: BulkUploadService, private establishmentService: EstablishmentService) {}

  public downloadFile(event: Event, type: BulkUploadFileType) {
    console.log(type);
    event.preventDefault();
    this.bulkUploadService
      .getDataCSV(this.establishmentService.establishmentId, type)
      .pipe(take(1))
      .subscribe(
        response => {
          const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const filenameMatches = response.headers.get('content-disposition').match(filenameRegEx);
          const filename = filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
          const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });
          console.log(filenameRegEx, filenameMatches, filename, blob);
          saveAs(blob, filename);
        },
        () => {}
      );
  }
}
