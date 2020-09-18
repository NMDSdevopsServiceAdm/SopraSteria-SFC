import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-parent-confirmation-dialog',
  templateUrl: './parent-confirmation-dialog.component.html',
})
export class ParentConfirmationDialogComponent extends DialogComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: { headingText: string; paragraphText: string; buttonText: string },
    public dialog: Dialog<ParentConfirmationDialogComponent>,
  ) {
    super(data, dialog);
  }

  public close(confirmed: boolean) {
    this.dialog.close(confirmed);
  }
}
