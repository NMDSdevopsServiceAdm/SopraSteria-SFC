import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogComponent } from '@core/components/dialog.component';
import { AlertService } from '@core/services/alert.service';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-become-a-parent-dialog',
  templateUrl: './become-a-parent-dialog.component.html',
})
export class BecomeAParentDialogComponent extends DialogComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(DIALOG_DATA) public data,
    private parentRequestsService: ParentRequestsService,
    public dialog: Dialog<BecomeAParentDialogComponent>,
    private alertService: AlertService,
    private router: Router,
  ) {
    super(data, dialog);
  }

  ngOnInit() {}

  /**
   * Close dialog window after successful confirmation
   *
   * @param {any} true to close dialog after response or null to close without action
   * @return {void}
   */
  public closeDialogWindow(event: Event, confirm: any) {
    event.preventDefault();
    this.dialog.close(confirm);
  }

  /**
   * Send request to become a parent.
   * @param {void}
   * @return {void}
   */
  public sendRequestToBecomeAParent() {
    this.subscriptions.add(
      this.parentRequestsService.becomeParent().subscribe((data) => {
        if (data) {
          this.router.navigate(['/dashboard']);
          this.alertService.addAlert({
            type: 'success',
            message: 'Your request to become a parent organisation has been sent.',
          });
          this.closeDialogWindow(event, true);
        }
      }),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
