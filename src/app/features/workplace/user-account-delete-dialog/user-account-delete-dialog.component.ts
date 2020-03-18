import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { UserDetails } from '@core/model/userDetails.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-user-account-delete-dialog',
  templateUrl: './user-account-delete-dialog.component.html',
})
export class UserAccountDeleteDialogComponent extends DialogComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: { user: UserDetails },
    public dialog: Dialog<UserAccountDeleteDialogComponent>,
  ) {
    super(data, dialog);
  }

  public close(event: Event, deleteConfirmed: boolean) {
    event.preventDefault();
    this.dialog.close(deleteConfirmed);
  }
}
