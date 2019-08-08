import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-delete-qualification-dialog',
  templateUrl: './delete-qualification-dialog.component.html',
})
export class DeleteQualificationDialogComponent extends DialogComponent {
  constructor(@Inject(DIALOG_DATA) public data, public dialog: Dialog<DeleteQualificationDialogComponent>) {
    super(data, dialog);
  }

  close(confirm: boolean) {
    this.dialog.close(confirm);
  }
}
