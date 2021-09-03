import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import {
  WorkplaceNameAddressDirective,
} from '@shared/directives/create-workplace/workplace-name-address/workplace-name-address';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-workplace-name-address',
  templateUrl:
    '../../../shared/directives/create-workplace/workplace-name-address/workplace-name-address.component.html',
})
export class WorkplaceNameAddressComponent extends WorkplaceNameAddressDirective {
  public workplace: Establishment;
  constructor(
    private workplaceService: WorkplaceService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected featureFlagsService: FeatureFlagsService,
    private establishmentService: EstablishmentService,
  ) {
    super(backService, errorSummaryService, formBuilder, route, router, featureFlagsService, workplaceService);
  }

  protected init(): void {
    this.workplace = this.establishmentService.establishment;
    this.isWorkPlaceUpdate = true;
    this.setLocationAddress();
  }

  protected setFlow(): void {
    this.flow = `workplace/${this.establishmentService.establishmentId}`;
  }

  protected setErrorMessage(): void {
    this.workplaceErrorMessage = 'Enter the name of your workplace';
  }

  public setBackLink(): void {
    this.backService.setBackLink(this.establishmentService.returnTo);
  }

  get return() {
    return this.establishmentService.returnTo;
  }

  public returnToWorkPlace(event: Event) {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'workplace' });
  }

  protected setSelectedLocationAddress(): void {
    this.workplaceService.selectedLocationAddress$.next(this.getLocationAddress());
    this.workplaceService.manuallyEnteredWorkplace$.next(true);
    const selectedLocation = this.getLocationAddress();
    this.subscriptions.add(
      this.establishmentService.updateLocationDetails(this.workplace.uid, selectedLocation).subscribe((data) => {
        //check if address2 and address3 is not available
        if (!data.address2) {
          data.address2 = null;
        }
        if (!data.address3) {
          data.address3 = null;
        }
        this.establishmentService.setState({ ...this.workplace, ...data });
        this.router.navigate(this.establishmentService.returnTo.url, {
          fragment: this.establishmentService.returnTo.fragment,
        });
        this.establishmentService.setReturnTo(null);
      }),
    );
  }

  protected setLocationAddress(): void {
    this.workplaceService.locationAddresses$.next([this.getWorkplaceLocation()]);
    this.preFillForm(this.getWorkplaceLocation());
  }

  public getWorkplaceLocation(): LocationAddress {
    return {
      addressLine1: this.workplace.address1,
      addressLine2: this.workplace.address2,
      addressLine3: this.workplace.address3,
      county: this.workplace.county,
      locationName: this.workplace.name,
      postalCode: this.workplace.postcode,
      townCity: this.workplace.town,
    };
  }
}
