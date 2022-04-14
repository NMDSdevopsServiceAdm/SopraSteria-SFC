import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'confirm-inactive-workplace-deletion',
  templateUrl: './confirm-inactive-workplace-deletion.html',
})
export class ConfirmInactiveWorkplaceDeletionComponent extends DialogComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: { inactiveWorkplaceCount: number },
    public dialog: Dialog<ConfirmInactiveWorkplaceDeletionComponent>,
  ) {
    super(data, dialog);
  }

  public close(hasConfirmed: boolean) {
    this.dialog.close(hasConfirmed);
  }
}
