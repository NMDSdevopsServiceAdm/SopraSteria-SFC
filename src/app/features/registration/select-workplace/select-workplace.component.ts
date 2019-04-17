import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RegistrationService } from '@core/services/registration.service';
import { RegistrationModel } from '@core/model/registration.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-select-workplace',
  templateUrl: './select-workplace.component.html',
})
export class SelectWorkplaceComponent implements OnInit, OnDestroy {
  private registration: RegistrationModel;
  private subscriptions: Subscription = new Subscription();
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
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
    this.setupServerErrorsMap();

    this.subscriptions.add(
      this.registrationService.registration$.subscribe(
        (registration: RegistrationModel) => this.registration = registration
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

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 404,
        message: 'No location found.',
      },
      {
        name: 503,
        message: 'Database error.',
      },
    ];
  }

  private getLocationId(): string {
    return this.form.get('workplace').value;
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
    this.registrationService.selectedLocationId$.next(this.getLocationId());
    this.router.navigate(['/registration/select-main-service']);

    // this.subscriptions.add(
    //   this.registrationService.getLocationByLocationId(this.getLocationId()).subscribe(
    //     (data: RegistrationModel) => {
    //       if (data.success === 1) {
    //         this.registrationService.updateState(data);
    //         this.router.navigate(['/registration/select-main-service']);
    //       }
    //     },
    //     (error: HttpErrorResponse) => {
    //       this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    //       this.errorSummaryService.scrollToErrorSummary();
    //     },
    //   )
    // );
  }

  private getPostalCode(): string {
    return this.registration.locationdata[0].postalCode;
  }

  public workplaceNotFound(): void {
    this.registrationService.workPlaceNotFound$.next(this.getPostalCode());
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
