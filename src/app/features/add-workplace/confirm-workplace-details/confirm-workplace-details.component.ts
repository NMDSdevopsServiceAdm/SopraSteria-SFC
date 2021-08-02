import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { AddWorkplaceFlow, AddWorkplaceResponse } from '@core/model/workplace.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import {
  ConfirmWorkplaceDetailsDirective,
} from '@shared/directives/create-workplace/confirm-workplace-details/confirm-workplace-details.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-confirm-workplace-details',
  templateUrl: './confirm-workplace-details.component.html',
})
export class ConfirmWorkplaceDetailsComponent extends ConfirmWorkplaceDetailsDirective {
  public serverError: string;
  public serverErrorsMap: ErrorDefinition[] = this.workplaceService.serverErrorsMap;

  constructor(
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected router: Router,
    protected workplaceService: WorkplaceService,
    public backService: BackService,
    protected featureFlagsService: FeatureFlagsService,
  ) {
    super(backService, featureFlagsService);
  }

  protected init(): void {
    this.flow = '/add-workplace';
    this.getWorkplaceData();
  }

  protected getWorkplaceData(): void {
    this.locationAddress = this.workplaceService.selectedLocationAddress$.value;
    this.workplace = this.workplaceService.selectedWorkplaceService$.value;
  }

  public setBackLink(): void {
    const backLinkUrl = this.createAccountNewDesign ? 'new-select-main-service' : 'select-main-service';
    this.backService.setBackLink({ url: [this.flow, backLinkUrl] });
  }

  public continue(): void {
    this.addWorkplace();
  }

  private addWorkplace(): void {
    this.subscriptions.add(
      this.workplaceService
        .addWorkplace(
          this.establishmentService.primaryWorkplace.uid,
          this.workplaceService.generateAddWorkplaceRequest(this.locationAddress, this.workplace),
        )
        .subscribe(
          (response: AddWorkplaceResponse) => {
            this.workplaceService.newWorkplaceUid = response.establishmentUid;
            this.workplaceService.addWorkplaceFlow$.next(AddWorkplaceFlow.NON_CQC);
            this.router.navigate([`${this.flow}/complete`]);
          },
          (response: HttpErrorResponse) => {
            this.serverError = this.errorSummaryService.getServerErrorMessage(response.status, this.serverErrorsMap);
            this.errorSummaryService.scrollToErrorSummary();
          },
        ),
    );
  }

  public onSetReturn(): void {
    this.workplaceService.setReturnTo({
      url: [`${this.flow}/confirm-details`],
    });
  }
}
