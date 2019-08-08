import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { AddWorkplaceFlow, AddWorkplaceResponse } from '@core/model/workplace.model';
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
  public serverErrorsMap: ErrorDefinition[] = this.workplaceService.serverErrorsMap;

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
    this.flow = '/add-workplace';
    this.getWorkplaceData();
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
      this.router.navigate([`${this.flow}/create-user-account`]);
    } else {
      this.addWorkplace();
    }
  }

  private addWorkplace(): void {
    this.subscriptions.add(
      this.workplaceService
        .addWorkplace(
          this.establishmentService.primaryWorkplace.uid,
          this.workplaceService.generateAddWorkplaceRequest(this.locationAddress, this.workplace)
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
          }
        )
    );
  }
}
