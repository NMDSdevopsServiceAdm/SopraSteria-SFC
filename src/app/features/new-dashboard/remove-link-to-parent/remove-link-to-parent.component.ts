import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
//import { ParentRequestsService } from '@core/services/parent-requests.service';
//import { DialogComponent } from '@core/components/dialog.component';
//import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-remove-link-to-parent',
  templateUrl: './remove-link-to-parent.component.html',
})
export class RemoveLinkToParentComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  protected subscriptions: Subscription = new Subscription();
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;

  constructor(
    private establishmentService: EstablishmentService,
    private errorSummaryService: ErrorSummaryService,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private alertService: AlertService,
    private permissionsService: PermissionsService,
    private ref: ChangeDetectorRef,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.breadcrumbService.show(JourneyType.REMOVE_LINK_TO_PARENT, this.workplace.name);
    this.setupServerErrorsMap();
  }

  //setup server error message
  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 500,
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

  // send request to backend for delink to parent
  public removeLinkToParent() {
    //event.preventDefault();
    this.subscriptions.add(
      this.establishmentService
        .removeParentAssociation(this.workplace.uid, { parentWorkplaceUId: this.workplace.parentUid })
        .subscribe(
          () => {
            this.router.navigate(['/dashboard']);
            this.alertService.addAlert({
              type: 'success',
              message: `You've removed your link to ${this.workplace.parentName}, ${this.workplace.postcode}`,
            });
          },
          (error) => {
            this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          },
        ),
    );
  }

  public returnToHome(): void {
    this.router.navigate(['/dashboard']);
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
