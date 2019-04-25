import { Component, OnDestroy, OnInit } from '@angular/core';
import { RegistrationService } from '../../../core/services/registration.service';
import { Subscription } from 'rxjs';
import { LocationAddress } from '@core/model/location.model';
import { WorkplaceService } from '@core/model/workplace-service.model';

@Component({
  selector: 'app-confirm-workplace-details',
  templateUrl: './confirm-workplace-details.component.html',
})
export class ConfirmWorkplaceDetailsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  protected locationAddress: LocationAddress;
  protected workplaceService: WorkplaceService;

  constructor(private registrationService: RegistrationService) {}

  ngOnInit() {
    this.getWorkplaceData();
  }

  private getWorkplaceData(): void {
    this.subscriptions.add(
      this.registrationService.selectedLocationAddress$.subscribe(
        (locationAddress: LocationAddress) => this.locationAddress = locationAddress
      )
    );

    this.subscriptions.add(
      this.registrationService.selectedWorkplaceService$.subscribe(
        (workplaceService: WorkplaceService) => this.workplaceService = workplaceService
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
