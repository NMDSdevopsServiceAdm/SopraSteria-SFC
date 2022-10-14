import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectWorkplaceDirective } from '@shared/directives/create-workplace/select-workplace/select-workplace.directive';

@Component({
  selector: 'app-select-workplace',
  templateUrl: '../../../shared/directives/create-workplace/select-workplace/select-workplace.component.html',
})
export class SelectWorkplaceComponent extends SelectWorkplaceDirective {
  public workplace: Establishment;
  private back: string;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    public establishmentService: EstablishmentService,
    public workplaceService: WorkplaceService,
  ) {
    super(backService, errorSummaryService, formBuilder, router, route, workplaceService);
  }

  protected init(): void {
    this.flow = `workplace/${this.establishmentService.establishmentId}`;
    this.workplace = this.establishmentService.establishment;
    this.back = `${this.flow}/regulated-by-cqc`;
    !this.locationAddresses && this.redirect();
    this.isCQCLocationUpdate = true;
    this.returnToConfirmDetails = this.establishmentService.returnTo;
  }

  private redirect(): void {
    this.router.navigate([this.back]);
  }

  public setSubmitAction(payload: { action: string; save: boolean }): void {
    if (!payload.save) {
      this.navigate();
    }
  }

  protected navigate(): void {
    this.router.navigate(this.return.url, { fragment: this.return.fragment, queryParams: this.return.queryParams });
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: [this.back] });
  }

  get return() {
    return this.establishmentService.returnTo;
  }

  protected save(): void {
    const selectedLocation = this.getSelectedLocation();
    this.workplaceService.selectedLocationAddress$.next(selectedLocation);
    this.subscriptions.add(
      this.establishmentService.updateLocationDetails(this.workplace.uid, selectedLocation).subscribe((data) => {
        this.establishmentService.setState({ ...this.workplace, ...data });
      }),
    );
  }

  protected navigateToNextPage(): void {
    this.router.navigate(this.establishmentService.returnTo.url, {
      fragment: this.establishmentService.returnTo.fragment,
    });
    this.establishmentService.setReturnTo(null);
  }
}
