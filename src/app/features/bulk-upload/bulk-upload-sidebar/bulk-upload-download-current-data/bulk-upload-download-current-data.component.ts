import { Component, Input } from '@angular/core';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { FileUtil } from '@core/utils/file-util';
import saveAs from 'file-saver';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-bulk-upload-download-current-data',
  templateUrl: './bulk-upload-download-current-data.component.html',
})
export class BulkUploadDownloadCurrentDataComponent {
  @Input() public sanitise: boolean;
  public BulkUploadFileType = BulkUploadFileType;
  public now: Date = new Date();

  constructor(private bulkUploadService: BulkUploadService, private establishmentService: EstablishmentService) {}

  public downloadFile(event: Event, type: BulkUploadFileType): void {
    event.preventDefault();
    this.bulkUploadService
      .getDataCSV(this.establishmentService.establishmentId, type)
      .pipe(take(1))
      .subscribe(
        (response) => {
          const filename = FileUtil.getFileName(response);
          const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });
          saveAs(blob, filename);
        },
        (err) => {
          console.error('Error getting file' + err);
        },
      );
  }
}
