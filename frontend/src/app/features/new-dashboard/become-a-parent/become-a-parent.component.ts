import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-become-a-parent',
  templateUrl: './become-a-parent.component.html',
  styleUrls: ['./become-a-parent.component.scss'],
})
export class BecomeAParentComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();
  public workplace: Establishment;
  public isBecomeParentRequestPending: boolean;
  public canBecomeAParent: boolean;
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;

  constructor(
    private parentRequestsService: ParentRequestsService,
    private router: Router,
    protected route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private errorSummaryService: ErrorSummaryService,
    private permissionsService: PermissionsService,
    private alertService: AlertService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.breadcrumbService.show(JourneyType.BECOME_A_PARENT);

    if (this.workplace) {
      this.subscriptions.add(
        this.parentRequestsService.parentStatusRequested(this.workplace.id).subscribe((parentStatusRequested) => {
          this.isBecomeParentRequestPending = parentStatusRequested;
        }),
      );

      this.canBecomeAParent = this.permissionsService.can(this.workplace.uid, 'canBecomeAParent');
    }
    this.setupServerErrorsMap();
  }

  //setup server error message
  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 500,
        message: 'We could not cancel parent request. You can try again or contact us.',
      },
      {
        name: 400,
        message: 'Unable to cancel parent request.',
      },
      {
        name: 404,
        message: 'Cancel parent request to parent service not found. You can try again or contact us.',
      },
    ];
  }

  public sendRequestToBecomeAParent() {
    this.subscriptions.add(
      this.parentRequestsService.becomeParent().subscribe((data) => {
        if (data) {
          this.router
            .navigate(['/dashboard'], {
              state: {
                parentStatusRequested: true,
              },
            })
            .then(() => {
              this.alertService.addAlert({
                type: 'success',
                message: 'You’ve sent a request to become a parent workplace',
              });
            });
        }
      }),
    );
  }

  public sendCancelToBecomeAParent(event) {
    event.preventDefault();
    this.subscriptions.add(
      this.parentRequestsService.cancelBecomeAParent().subscribe(
        () => {
          this.router
            .navigate(['/dashboard'], {
              state: {
                parentStatusRequested: false,
              },
            })
            .then(() => {
              this.alertService.addAlert({
                type: 'success',
                message: "You've cancelled your request to become a parent workplace",
              });
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
