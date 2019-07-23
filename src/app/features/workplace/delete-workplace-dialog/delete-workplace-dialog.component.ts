import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-delete-workplace-dialog',
  templateUrl: './delete-workplace-dialog.component.html',
})
export class DeleteWorkplaceDialogComponent extends DialogComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: { workplaceName: string },
    public dialog: Dialog<DeleteWorkplaceDialogComponent>
  ) {
    super(data, dialog);
  }

  public close(deleteConfirmed: boolean) {
    this.dialog.close(deleteConfirmed);
  }
}
