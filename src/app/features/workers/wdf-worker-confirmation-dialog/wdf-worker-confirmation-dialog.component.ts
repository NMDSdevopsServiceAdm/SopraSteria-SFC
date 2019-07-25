import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-wdf-worker-confirmation-dialog',
  templateUrl: './wdf-worker-confirmation-dialog.component.html',
})
export class WdfWorkerConfirmationDialogComponent extends DialogComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: { daysSick: string; pay: string },
    public dialog: Dialog<WdfWorkerConfirmationDialogComponent>
  ) {
    super(data, dialog);
  }

  public close(confirmed: boolean) {
    this.dialog.close(confirmed);
  }
}
