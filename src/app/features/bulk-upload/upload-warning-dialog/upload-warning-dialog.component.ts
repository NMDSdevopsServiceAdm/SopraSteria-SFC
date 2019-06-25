import { Component, Inject } from '@angular/core';
import { ValidatedFile } from '@core/model/bulk-upload.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-upload-warning-dialog',
  templateUrl: './upload-warning-dialog.component.html',
})
export class UploadWarningDialogComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: { establishmentsFile: ValidatedFile; workersFile: ValidatedFile },
    public dialog: Dialog<UploadWarningDialogComponent>
  ) {}

  public close(continueUpload: boolean) {
    this.dialog.close(continueUpload);
  }

  public displayDownloadLink(file: ValidatedFile) {
    return file.deleted > 0;
  }
}
