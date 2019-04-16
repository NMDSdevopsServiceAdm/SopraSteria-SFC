import { Component, Inject } from '@angular/core';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-delete-qualification-dialog',
  templateUrl: './delete-qualification-dialog.component.html',
})
export class DeleteQualificationDialogComponent {
  constructor(@Inject(DIALOG_DATA) public data, public dialog: Dialog<DeleteQualificationDialogComponent>) {}

  close(confirm: boolean) {
    this.dialog.close(confirm);
  }
}
