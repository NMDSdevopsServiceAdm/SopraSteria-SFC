import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectWorkplace } from '@features/workplace-find-and-select/select-workplace/select-workplace';

@Component({
  selector: 'app-select-workplace',
  templateUrl: './select-workplace.component.html',
})
export class SelectWorkplaceComponent extends SelectWorkplace {
  public workplace: Establishment;
  constructor(
    private workplaceService: WorkplaceService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    private establishmentService: EstablishmentService
  ) {
    super(backService, errorSummaryService, formBuilder, router);
  }

  protected init() {
    this.flow = `workplace/${this.establishmentService.establishmentId}`;
    this.workplace = this.establishmentService.establishment;
    this.setBackLink();
    this.setupSubscription();
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: [`${this.flow}/regulated-by-cqc`] });
  }

  get return() {
    return this.establishmentService.returnTo;
  }

  protected setupSubscription(): void {
    this.subscriptions.add(
      this.workplaceService.locationAddresses$.subscribe(
        (locationAddresses: Array<LocationAddress>) => (this.locationAddresses = locationAddresses)
      )
    );
  }

  protected save(): void {
    this.workplaceService.selectedLocationAddress$.next(this.getSelectedLocation());
    const selectedLocation = this.getSelectedLocation();
    this.subscriptions.add(
      this.establishmentService.updateCQCDetails(this.workplace.uid, selectedLocation).subscribe(data => {
        this.establishmentService.setState({ ...this.workplace, ...data });
        this.router.navigate(this.establishmentService.returnTo.url, {
          fragment: this.establishmentService.returnTo.fragment,
        });
        this.establishmentService.setReturnTo(null);
      })
    );
  }

  public returnToWorkPlace(event: Event) {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'workplace' });
  }
}
