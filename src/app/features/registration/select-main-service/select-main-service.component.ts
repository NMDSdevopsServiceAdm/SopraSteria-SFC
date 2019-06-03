import { BackService } from '@core/services/back.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { filter } from 'lodash';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LocationAddress } from '@core/model/location.model';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WorkplaceCategory } from '@core/model/workplace-category.model';
import { WorkplaceService } from '@core/model/workplace-service.model';

@Component({
  selector: 'app-select-main-service',
  templateUrl: './select-main-service.component.html',
})
export class SelectMainServiceComponent implements OnInit, OnDestroy {
  private otherServiceMaxLength = 120;
  private subscriptions: Subscription = new Subscription();
  public allServices: Array<WorkplaceService> = [];
  public categories: Array<WorkplaceCategory>;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public renderForm = false;
  public selectedWorkplace: WorkplaceService;
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
  public submitted = false;

  constructor(
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.getSelectedLocation();
    this.getSelectedWorkplace();
    this.setBackLink();
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
      this.registrationService.selectedLocationAddress$.subscribe((location: LocationAddress) =>
        this.getServicesByCategory(location)
      )
    );
  }

  private getSelectedWorkplace(): void {
    this.subscriptions.add(
      this.registrationService.selectedWorkplaceService$.subscribe((workplace: WorkplaceService) => {
        if (workplace) {
          this.selectedWorkplace = workplace;
        }
      })
    );
  }

  private getServicesByCategory(location: LocationAddress): void {
    const isRegulated: boolean = this.registrationService.isRegulated(location);

    this.subscriptions.add(
      this.registrationService.getServicesByCategory(isRegulated).subscribe(
        (categories: Array<WorkplaceCategory>) => {
          this.categories = categories;
          this.categories.forEach((data: WorkplaceCategory) => this.allServices.push(...data.services));
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        },
        () => this.updateForm()
      )
    );
  }

  /**
   * If workplace services have an other flag create additional optional text fields in the form
   * Also update formErrorsMap in order to add maxlength validation
   */
  private updateForm(): void {
    this.allServices.forEach((service: WorkplaceService) => {
      if (service.other) {
        this.form.addControl(
          `otherWorkplaceService${service.id}`,
          new FormControl(null, [Validators.maxLength(this.otherServiceMaxLength)])
        );

        this.formErrorsMap.push({
          item: `otherWorkplaceService${service.id}`,
          type: [
            {
              name: 'maxlength',
              message: `Other service must be ${this.otherServiceMaxLength} characters or less`,
            },
          ],
        });
      }
    });

    this.preFillForm();
  }

  /**
   * Pre fill form iff user has previously selected a workplace
   * Then set boolean flag for ui to render the form
   */
  private preFillForm(): void {
    if (this.selectedWorkplace) {
      this.form.get('workplaceService').patchValue(this.selectedWorkplace.id);

      if (this.selectedWorkplace.other) {
        this.form.get(`otherWorkplaceService${this.selectedWorkplace.id}`).patchValue(this.selectedWorkplace.otherName);
      }
    }

    this.renderForm = true;
  }

  private getSelectedWorkPlaceService(): WorkplaceService {
    const selectedWorkPlaceServiceId: number = parseInt(this.form.get('workplaceService').value, 10);
    const workplaceService: WorkplaceService = filter(this.allServices, { id: selectedWorkPlaceServiceId })[0];

    if (workplaceService.other) {
      workplaceService.otherName = this.form.get(`otherWorkplaceService${selectedWorkPlaceServiceId}`).value;
    }

    return workplaceService;
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

  private setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/regulated-by-cqc'] });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
