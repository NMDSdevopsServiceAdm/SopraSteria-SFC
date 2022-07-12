import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
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
  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    private establishmentService: EstablishmentService,
    private workplaceService: WorkplaceService,
  ) {
    super(backService, errorSummaryService, formBuilder, router, workplaceService);
  }

  protected init(): void {
    this.flow = `workplace/${this.establishmentService.establishmentId}`;
    this.workplace = this.establishmentService.establishment;
    this.isCQCLocationUpdate = true;
  }

  public setSubmitAction(payload: { action: string; save: boolean }): void {
    if (!payload.save) {
      this.navigate();
    }
  }

  protected navigate(): void {
    this.router.navigate(this.return.url, { fragment: this.return.fragment, queryParams: this.return.queryParams });
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: [`${this.flow}/regulated-by-cqc`] });
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
        this.router.navigate(this.establishmentService.returnTo.url, {
          fragment: this.establishmentService.returnTo.fragment,
        });
        this.establishmentService.setReturnTo(null);
      }),
    );
  }

  public returnToWorkPlace(event: Event) {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'workplace' });
  }
}
