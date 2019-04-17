import { WorkplaceCategory } from '@core/model/workplace-category.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@core/model/location.model';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { WorkplaceService } from '@core/model/workplace-service.model';
import { filter } from 'lodash';

@Component({
  selector: 'app-select-main-service',
  templateUrl: './select-main-service.component.html',
})
export class SelectMainServiceComponent implements OnInit, OnDestroy {
  private location: Location;
  private subscriptions: Subscription = new Subscription();
  public categories: Array<WorkplaceCategory>;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;
  public serverErrorsMap: Array<ErrorDefinition>;
  public serverError: string;

  constructor(
    private errorSummaryService: ErrorSummaryService,
    private registrationService: RegistrationService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.getSelectedLocation();
  }

  private setupForm(): void {
    this.form = this.fb.group({
      workplaceService: ['', Validators.required],
    });
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'workplaceService',
        type: [
          {
            name: 'required',
            message: 'Please select a main service.',
          },
        ],
      },
    ];
  }

  // TODO clean up / verify from api doc
  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 404,
        message: 'No location found.',
      },
      {
        name: 400,
        message: 'Invalid Postcode.',
      },
      {
        name: 503,
        message: 'Database error.',
      },
    ];
  }

  private getSelectedLocation(): void {
    this.subscriptions.add(
      this.registrationService.selectedLocation$.subscribe(
        (location: Location) => {
          this.location = location;
          this.getServicesByCategory();
        }
      )
    );
  }

  private isRegulated(): boolean {
    return this.location.isRegulated === true || this.location.locationId ? true : false;
  }

  private getServicesByCategory(): void {
    this.subscriptions.add(
      this.registrationService.getServicesByCategory(this.isRegulated()).subscribe(
        (categories: Array<WorkplaceCategory>) => this.categories = categories,
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        }
      )
    );
  }

  private getSelectedWorkPlaceService(): WorkplaceService {
    const selectedWorkPlaceServiceId: number = parseInt(this.form.get('workplaceService').value, 10);
    return filter(this.categories, { services: [{ id: selectedWorkPlaceServiceId }] })[0].services[0];
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.registrationService.selectedWorkplaceService$.next(this.getSelectedWorkPlaceService());
      this.router.navigate(['/registration/confirm-workplace-details']);
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
