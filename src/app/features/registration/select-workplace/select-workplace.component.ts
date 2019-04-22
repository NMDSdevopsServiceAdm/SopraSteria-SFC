import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RegistrationService } from '@core/services/registration.service';
import { WorkplaceLocation } from '@core/model/workplace-location.model';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { filter } from 'lodash';

@Component({
  selector: 'app-select-workplace',
  templateUrl: './select-workplace.component.html',
})
export class SelectWorkplaceComponent implements OnInit, OnDestroy {
  private workplaceLocations: Array<WorkplaceLocation>;
  private subscriptions: Subscription = new Subscription();
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;

  constructor(
    private errorSummaryService: ErrorSummaryService,
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setupForm();
    this.setupFormErrorsMap();

    this.subscriptions.add(
      this.registrationService.workplaceLocations$.subscribe(
        (workplaceLocations: Array<WorkplaceLocation>) => this.workplaceLocations = workplaceLocations
      )
    );
  }

  private setupForm(): void {
    this.form = this.fb.group({
      workplace: ['', Validators.required],
    });
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'workplace',
        type: [
          {
            name: 'required',
            message: 'Please select an address.',
          },
        ],
      },
    ];
  }

  private getSelectedLocation(): WorkplaceLocation {
    const selectedLocationId: string = this.form.get('workplace').value;
    return filter(this.workplaceLocations, ['locationId', selectedLocationId])[0];
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.save();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  /**
   * Pass in formGroup or formControl name and errorType
   * Then return error message
   * @param item
   * @param errorType
   */
  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private save(): void {
    this.registrationService.selectedWorkplaceLocation$.next(this.getSelectedLocation());
    this.router.navigate(['/registration/select-main-service']);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
