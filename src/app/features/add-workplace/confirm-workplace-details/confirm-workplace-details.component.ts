import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { AddWorkplaceRequest } from '@core/model/workplace.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { ConfirmWorkplaceDetails } from '@features/workplace-find-and-select/confirm-workplace-details/confirm-workplace-details';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-confirm-workplace-details',
  templateUrl: './confirm-workplace-details.component.html',
})
export class ConfirmWorkplaceDetailsComponent extends ConfirmWorkplaceDetails {
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;

  constructor(
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private workplaceService: WorkplaceService,
    protected backService: BackService
  ) {
    super(backService);
  }

  protected init(): void {
    this.flow = '/registration';
    this.setupServerErrorsMap();
    this.getWorkplaceData();
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'Data validation error.',
      },
    ];
  }

  protected getWorkplaceData(): void {
    this.subscriptions.add(
      combineLatest(
        this.workplaceService.selectedLocationAddress$,
        this.workplaceService.selectedWorkplaceService$
      ).subscribe(([locationAddress, workplace]) => {
        this.locationAddress = locationAddress;
        this.workplace = workplace;
      })
    );
  }

  public continue(): void {
    if (this.workplace.isCQC) {
      this.router.navigate(['/add-workplace/create-user-account']);
    } else {
      this.addWorkplace();
    }
  }

  private generateRequest(): AddWorkplaceRequest {
    return {
      addressLine1: this.locationAddress.addressLine1,
      addressLine2: this.locationAddress.addressLine2,
      county: this.locationAddress.county,
      isRegulated: this.workplace.isCQC,
      locationName: this.locationAddress.locationName,
      mainService: this.workplace.name,
      postalCode: this.locationAddress.postalCode,
      townCity: this.locationAddress.townCity,
    };
  }

  private addWorkplace(): void {
    this.subscriptions.add(
      this.workplaceService
        .addWorkplace(this.establishmentService.primaryWorkplace.uid, this.generateRequest())
        .subscribe(
          () => {
            this.router.navigate(['/add-workplace/complete']);
          },
          (response: HttpErrorResponse) => {
            this.serverError = this.errorSummaryService.getServerErrorMessage(response.status, this.serverErrorsMap);
            this.errorSummaryService.scrollToErrorSummary();
          }
        )
    );
  }
}
