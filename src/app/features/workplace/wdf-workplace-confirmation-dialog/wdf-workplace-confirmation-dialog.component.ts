import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { Establishment } from '@core/model/establishment.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-wdf-workplace-confirmation-dialog',
  templateUrl: './wdf-workplace-confirmation-dialog.component.html',
})
export class WdfWorkplaceConfirmationDialogComponent extends DialogComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: { workplace: Establishment },
    public dialog: Dialog<WdfWorkplaceConfirmationDialogComponent>,
  ) {
    super(data, dialog);
  }

  public close(confirmed: boolean) {
    this.dialog.close(confirmed);
  }
}
