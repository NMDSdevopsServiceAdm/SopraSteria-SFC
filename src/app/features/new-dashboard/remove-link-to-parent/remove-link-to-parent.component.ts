import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
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
  public parentPostcode: string;
  public allParents;

  constructor(
    private establishmentService: EstablishmentService,
    private errorSummaryService: ErrorSummaryService,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.breadcrumbService.show(JourneyType.REMOVE_LINK_TO_PARENT, this.workplace.name);
    this.setupServerErrorsMap();
    this.getAllParents();
  }

  private getAllParents() {
    this.subscriptions.add(
      this.establishmentService.getAllParentWithPostCode().subscribe(
        (parentsWithPostCode) => {
          this.allParents = parentsWithPostCode;
          this.getParentPostcode(this.allParents);
        },
        (error) => {
          if (error.error.message) {
            this.serverError = error.error.message;
          }
        },
      ),
    );
  }

  public getParentPostcode(allParents): void {
    const parentUid = this.workplace?.parentUid;

    if (allParents) {
      const parent = this.allParents.find((parent) => parent.uid === parentUid);
      this.parentPostcode = parent?.postcode;
    }
  }

  //setup server error message
  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 500,
        message: 'We could not send request to remove parent association. You can try again or contact us.',
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

  public removeLinkToParent(): void {
    this.subscriptions.add(
      this.establishmentService
        .removeParentAssociation(this.workplace.uid, { parentWorkplaceUId: this.workplace.parentUid })
        .subscribe(
          () => {
            this.router.navigate(['/dashboard'], {
              state: {
                alertMessage: `You've removed your link to ${this.workplace.parentName}, ${this.parentPostcode}`,
                removeLinkToParentSuccess: true,
              },
            });
          },
          (error) => {
            this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          },
        ),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
