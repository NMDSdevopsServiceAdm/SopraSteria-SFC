import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { WorkplaceService } from '@core/services/workplace.service';
import {
  EnterWorkplaceAddressDirective,
} from '@shared/directives/create-workplace/enter-workplace-address/enter-workplace-address';

@Component({
  selector: 'app-workplace-name-address',
  templateUrl:
    '../../../shared/directives/create-workplace/enter-workplace-address/enter-workplace-address.component.html',
})
export class WorkplaceNameAddressComponent extends EnterWorkplaceAddressDirective {
  public returnToWorkplaceNotFound: boolean;
  public isCqcRegulated: boolean;

  constructor(
    private workplaceService: WorkplaceService,
    private registrationService: RegistrationService,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, formBuilder, route, router);
  }

  protected init(): void {
    this.flow = '/add-workplace';
    this.title = `What's the workplace name and address?`;
    this.workplaceErrorMessage = 'Enter the name of the workplace';
    this.returnToWorkplaceNotFound = this.registrationService.workplaceNotFound$.value;
    this.isCqcRegulated = this.registrationService.isCqcRegulated$.value;

    this.setBackLink();
    this.setupSubscription();
    this.registrationService.workplaceNotFound$.next(false);
  }

  private setupSubscription(): void {
    this.subscriptions.add(
      this.workplaceService.selectedLocationAddress$.subscribe((selectedLocation: LocationAddress) => {
        if (selectedLocation) {
          this.preFillForm(selectedLocation);
        }
      }),
    );
  }

  protected setSelectedLocationAddress(): void {
    this.workplaceService.selectedLocationAddress$.next(this.getLocationAddress());
    this.workplaceService.manuallyEnteredWorkplace$.next(true);
    this.router.navigate([`${this.flow}/select-main-service`]);
  }

  public setBackLink(): void {
    if (this.returnToWorkplaceNotFound) {
      this.backService.setBackLink({ url: [this.flow, 'new-workplace-not-found'] });
      return;
    }

    if (this.isCqcRegulated) {
      this.backService.setBackLink({ url: [this.flow, 'select-workplace'] });
      return;
    }

    this.backService.setBackLink({ url: [this.flow, 'select-workplace-address'] });
  }
}
