import { Component } from '@angular/core';
import { BackService } from '@core/services/back.service';
import { RegistrationService } from '@core/services/registration.service';
import { ConfirmWorkplaceDetailsDirective } from '@shared/directives/create-workplace/confirm-workplace-details/confirm-workplace-details.directive';

@Component({
  selector: 'app-confirm-workplace-details',
  templateUrl: './confirm-workplace-details.component.html',
})
export class ConfirmWorkplaceDetailsComponent extends ConfirmWorkplaceDetailsDirective {
  constructor(protected registrationService: RegistrationService, protected backService: BackService) {
    super(backService);
  }

  protected async init(): Promise<void> {
    this.flow = '/registration';
    this.resetReturnTo();
    this.getWorkplaceData();
  }

  protected getWorkplaceData(): void {
    this.locationAddress = this.registrationService.selectedLocationAddress$.value;
    this.workplace = this.registrationService.selectedWorkplaceService$.value;
    this.WorkplaceTotalStaff = this.registrationService.totalStaff$.value;
    this.employerTypeObject = this.registrationService.typeOfEmployer$.value;
  }

  public onSetReturn(): void {
    this.registrationService.setReturnTo({
      url: [`${this.flow}/confirm-details`],
    });
  }

  private resetReturnTo(): void {
    this.registrationService.returnTo$.next(null);
  }
}
