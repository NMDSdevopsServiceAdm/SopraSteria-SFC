import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { ValidatedFile } from '@core/model/bulk-upload.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-upload-warning-dialog',
  templateUrl: './upload-warning-dialog.component.html',
})
export class UploadWarningDialogComponent extends DialogComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: { establishmentsFile: ValidatedFile; workersFile: ValidatedFile },
    public dialog: Dialog<UploadWarningDialogComponent>
  ) {
    super(data, dialog);
  }

  public close(continueUpload: boolean) {
    this.dialog.close(continueUpload);
  }

  public displayDownloadLink(file: ValidatedFile) {
    return file.deleted > 0;
  }
}
