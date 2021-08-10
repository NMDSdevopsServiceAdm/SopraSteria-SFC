import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-reset-dialog',
  templateUrl: './reset-dialog.component.html',
})
export class ResetDialogComponent extends DialogComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: { headingText: string; paragraphText: string; buttonText: string },
    public dialog: Dialog<ResetDialogComponent>,
  ) {
    super(data, dialog);
  }

  public close(confirmed: boolean): void {
    this.dialog.close(confirmed);
  }
}
