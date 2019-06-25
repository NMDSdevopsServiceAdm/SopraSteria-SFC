import { Component, Inject } from '@angular/core';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-complete-upload-warning-dialog',
  templateUrl: './complete-upload-warning-dialog.component.html',
})
export class CompleteUploadWarningDialogComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: { deletedWorkplaces: number; deletedStaffRecords: number },
    public dialog: Dialog<CompleteUploadWarningDialogComponent>
  ) {}

  public close(continueUpload: boolean) {
    this.dialog.close(continueUpload);
  }
}
