import { Component, Inject } from '@angular/core';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-delete-training-dialog',
  templateUrl: './delete-training-dialog.component.html',
})
export class DeleteTrainingDialogComponent {
  constructor(@Inject(DIALOG_DATA) public data, public dialog: Dialog<DeleteTrainingDialogComponent>) {}

  close(confirm: boolean) {
    this.dialog.close(confirm);
  }
}
