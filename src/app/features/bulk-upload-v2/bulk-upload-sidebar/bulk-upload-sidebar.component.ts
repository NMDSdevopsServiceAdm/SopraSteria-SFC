import { Component } from '@angular/core';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { take } from 'rxjs/operators';
import { FileUtil } from '@core/utils/file-util';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-bulk-upload-sidebar',
  templateUrl: './bulk-upload-sidebar.component.html',
})
export class BulkUploadSidebarComponent {
  public BulkUploadFileType = BulkUploadFileType;
  public now: Date = new Date();

  constructor(
    private bulkUploadService: BulkUploadService,
    private establishmentService: EstablishmentService,
    private authService:AuthService
  ) {}

  public isAdminUser(): boolean {
    return this.authService.isAdmin;
  }

  public downloadFile(event: Event, type: BulkUploadFileType) {
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
