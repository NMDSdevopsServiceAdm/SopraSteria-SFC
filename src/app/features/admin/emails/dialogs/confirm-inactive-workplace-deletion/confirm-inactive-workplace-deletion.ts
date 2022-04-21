import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-confirm-inactive-workplace-deletion',
  templateUrl: './confirm-inactive-workplace-deletion.html',
})
export class ConfirmInactiveWorkplaceDeletionComponent extends DialogComponent {
  public revealTitle: string;
  constructor(
    @Inject(DIALOG_DATA) public data: { numberOfInactiveWorkplacesForDeletion: number },
    public dialog: Dialog<ConfirmInactiveWorkplaceDeletionComponent>,
  ) {
    super(data, dialog);
  }

  ngOnInit(): void {
    this.revealTitle = `You're about to delete ${this.data.numberOfInactiveWorkplacesForDeletion} inactive  ${
      this.data.numberOfInactiveWorkplacesForDeletion == 1 ? 'account' : 'accounts'
    } `;
  }

  public close(hasConfirmed: boolean) {
    this.dialog.close(hasConfirmed);
  }
}
