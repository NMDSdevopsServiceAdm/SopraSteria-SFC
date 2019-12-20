import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { Workplace } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-link-to-parent-remove-dialog',
  templateUrl: './link-to-parent-remove-dialog.component.html',
})
export class LinkToParentRemoveDialogComponent extends DialogComponent implements OnInit, OnDestroy {
  public workplace: Workplace;
  protected subscriptions: Subscription = new Subscription();
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;

  constructor(
    @Inject(DIALOG_DATA) public data,
    private establishmentService: EstablishmentService,
    private errorSummaryService: ErrorSummaryService,
    private router: Router,
    private alertService: AlertService,
    private permissionsService: PermissionsService,
    public dialog: Dialog<LinkToParentRemoveDialogComponent>
  ) {
    super(data, dialog);
  }

  ngOnInit() {
    this.workplace = this.data;
    this.setupServerErrorsMap();
  }

  //setup server error message
  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'We could not send request to  remove parent association. You can try again or contact us.',
      },
      {
        name: 400,
        message: 'Unable to send request to remove parent association.',
      },
      {
        name: 404,
        message: 'Send request to remove parent association service not found. You can try again or contact us.',
      },
    ];
  }

  close(returnToClose: any) {
    this.dialog.close(returnToClose);
  }

  public removeLinkToParent($event: Event) {
    $event.preventDefault();
    this.subscriptions.add(
      this.establishmentService
        .removeParentAssociation(this.workplace.uid, { parentWorkplaceUId: this.workplace.parentUid })
        .subscribe(
          data => {
            if (data) {
              this.close({ closeFrom: 'remove-link' });
            }
          },
          error => {
            this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          }
        )
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
