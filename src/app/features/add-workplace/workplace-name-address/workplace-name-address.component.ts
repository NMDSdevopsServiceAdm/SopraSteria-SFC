import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import {
  EnterWorkplaceAddressDirective,
} from '@shared/directives/create-workplace/enter-workplace-address/enter-workplace-address';

@Component({
  selector: 'app-enter-workplace-address',
  templateUrl:
    '../../../shared/directives/create-workplace/enter-workplace-address/enter-workplace-address.component.html',
})
export class WorkplaceNameAddressComponent extends EnterWorkplaceAddressDirective {
  constructor(
    private workplaceService: WorkplaceService,
    protected backService: BackService,
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
    this.setupSubscription();
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

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'workplaceName',
        type: [
          {
            name: 'required',
            message: 'Enter the name of the workplace',
          },
          {
            name: 'maxlength',
            message: `Workplace name must be ${this.workplaceNameMaxLength} characters or fewer`,
          },
        ],
      },
      {
        item: 'address1',
        type: [
          {
            name: 'required',
            message: 'Enter the building (number or name) and street',
          },
          {
            name: 'maxlength',
            message: `Building and street must be ${this.addressMaxLength} characters or fewer`,
          },
        ],
      },
      {
        item: 'townOrCity',
        type: [
          {
            name: 'required',
            message: 'Enter the town or city',
          },
          {
            name: 'maxlength',
            message: `Town or city must be ${this.addressMaxLength} characters or fewer`,
          },
        ],
      },
      {
        item: 'county',
        type: [
          {
            name: 'required',
            message: 'Enter the county',
          },
          {
            name: 'maxlength',
            message: `County must be ${this.addressMaxLength} characters or fewer`,
          },
        ],
      },
      {
        item: 'postcode',
        type: [
          {
            name: 'required',
            message: 'Enter the postcode',
          },
          {
            name: 'maxlength',
            message: `Postcode must be ${this.postcodeMaxLength} characters or fewer`,
          },
        ],
      },
    ];
  }
}
