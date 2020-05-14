import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-delete-training-dialog',
  templateUrl: './delete-training-dialog.component.html',
})
export class DeleteTrainingDialogComponent extends DialogComponent {
  constructor(@Inject(DIALOG_DATA) public data, public dialog: Dialog<DeleteTrainingDialogComponent>) {
    super(data, dialog);
  }

  close(event: Event, confirm: boolean) {
    event.preventDefault();
    this.dialog.close(confirm);
  }
}
