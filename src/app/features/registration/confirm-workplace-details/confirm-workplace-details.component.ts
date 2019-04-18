import { Component, OnDestroy, OnInit } from '@angular/core';
import { RegistrationService } from '../../../core/services/registration.service';
import { Subscription } from 'rxjs';
import { WorkplaceLocation } from '@core/model/workplace-location.model';
import { WorkplaceService } from '@core/model/workplace-service.model';

@Component({
  selector: 'app-confirm-workplace-details',
  templateUrl: './confirm-workplace-details.component.html',
})
export class ConfirmWorkplaceDetailsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  protected workplaceLocation: WorkplaceLocation;
  protected workplaceService: WorkplaceService;

  constructor(private registrationService: RegistrationService) {}

  ngOnInit() {
    this.getWorkplaceData();
  }

  private getWorkplaceData(): void {
    this.subscriptions.add(
      this.registrationService.selectedWorkplaceLocation$.subscribe(
        (workplaceLocation: WorkplaceLocation) => this.workplaceLocation = workplaceLocation
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
