import { Component, OnDestroy, OnInit } from '@angular/core';
import { LocationAddress } from '@core/model/location.model';
import { Service } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { RegistrationService } from '@core/services/registration.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-workplace-details',
  templateUrl: './confirm-workplace-details.component.html',
})
export class ConfirmWorkplaceDetailsComponent implements OnInit, OnDestroy {
  public locationAddress: LocationAddress;
  public workplaceService: Service;
  private subscriptions: Subscription = new Subscription();

  constructor(private backService: BackService, private registrationService: RegistrationService) {}

  ngOnInit() {
    this.getWorkplaceData();
    this.setBackLink();
  }

  private getWorkplaceData(): void {
    this.subscriptions.add(
      this.registrationService.selectedLocationAddress$.subscribe(
        (locationAddress: LocationAddress) => (this.locationAddress = locationAddress)
      )
    );

    this.subscriptions.add(
      this.registrationService.selectedWorkplaceService$.subscribe(
        (workplaceService: Service) => (this.workplaceService = workplaceService)
      )
    );
  }

  private setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/select-main-service'] });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
