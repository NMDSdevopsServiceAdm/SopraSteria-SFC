import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-wdf-confirmation-dialog',
  templateUrl: './wdf-confirmation-dialog.component.html',
})
export class WdfConfirmationDialogComponent extends DialogComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: { daysSick: string; pay: string },
    public dialog: Dialog<WdfConfirmationDialogComponent>
  ) {
    super(data, dialog);
  }

  public close(confirmed: boolean) {
    this.dialog.close(confirmed);
  }
}
