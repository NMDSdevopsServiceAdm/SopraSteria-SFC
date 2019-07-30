import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { Service } from '@core/model/services.model';
import { AddWorkplaceRequest } from '@core/model/workplace.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { ConfirmWorkplaceDetails } from '@features/workplace-find-and-select/confirm-workplace-details/confirm-workplace-details';

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
      this.workplaceService.selectedLocationAddress$.subscribe(
        (locationAddress: LocationAddress) => (this.locationAddress = locationAddress)
      )
    );

    this.subscriptions.add(
      this.workplaceService.selectedWorkplaceService$.subscribe((workplace: Service) => (this.workplace = workplace))
    );
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

  public addWorkplace(event: Event): void {
    event.preventDefault();

    this.subscriptions.add(
      this.workplaceService
        .addWorkplace(this.establishmentService.primaryWorkplace.uid, this.generateRequest())
        .subscribe(() => {
          this.router.navigate(['/add-workplace/complete']);
        }, (response: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(response.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        })
    );
  }
}
