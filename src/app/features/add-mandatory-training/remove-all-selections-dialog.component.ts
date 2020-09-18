import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-remove-all-selections-dialog',
  templateUrl: './remove-all-selections-dialog.component.html',
})
export class RemoveAllSelectionsDialogComponent extends DialogComponent {
  constructor(@Inject(DIALOG_DATA) public data: {}, public dialog: Dialog<RemoveAllSelectionsDialogComponent>) {
    super(data, dialog);
  }

  public close(confirmed: boolean) {
    this.dialog.close(confirmed);
  }
}
