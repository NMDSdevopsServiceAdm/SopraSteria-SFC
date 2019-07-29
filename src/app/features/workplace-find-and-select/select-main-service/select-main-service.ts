import { HttpErrorResponse } from '@angular/common/http';
import { OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { Service, ServiceGroup } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { filter } from 'lodash';
import { Subscription } from 'rxjs';

export class SelectMainService implements OnInit, OnDestroy {
  protected allServices: Array<Service> = [];
  protected flow: string;
  protected otherServiceMaxLength = 120;
  protected selectedWorkplace: Service;
  protected serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  public categories: Array<ServiceGroup>;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public renderForm = false;
  public serverError: string;
  public submitted = false;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected workplaceService: WorkplaceService
  ) {}

  ngOnInit() {
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.getSelectedLocation();
    this.getSelectedWorkplace();
    this.init();
    this.setBackLink();
  }

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      workplaceService: ['', Validators.required],
    });
  }

  protected setupFormErrorsMap(): void {
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

  protected setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 404,
        message: 'No location found.',
      },
      {
        name: 400,
        message: 'Invalid Postcode.',
      },
    ];
  }

  protected init(): void {}

  protected getSelectedLocation(): void {}

  protected getSelectedWorkplace(): void {}

  protected getServicesByCategory(location: LocationAddress): void {
    this.subscriptions.add(
      this.workplaceService.getServicesByCategory(this.workplaceService.isRegulated(location)).subscribe(
        (categories: Array<ServiceGroup>) => {
          this.categories = categories;
          this.categories.forEach((data: ServiceGroup) => this.allServices.push(...data.services));
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
  protected updateForm(): void {
    this.allServices.forEach((service: Service) => {
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
  protected preFillForm(): void {
    if (this.selectedWorkplace) {
      this.form.get('workplaceService').patchValue(this.selectedWorkplace.id);

      if (this.selectedWorkplace.other) {
        this.form.get(`otherWorkplaceService${this.selectedWorkplace.id}`).patchValue(this.selectedWorkplace.otherName);
      }
    }

    this.renderForm = true;
  }

  protected getSelectedWorkPlaceService(): Service {
    const selectedWorkPlaceServiceId: number = parseInt(this.form.get('workplaceService').value, 10);
    const workplaceService: Service = filter(this.allServices, { id: selectedWorkPlaceServiceId })[0];

    if (workplaceService.other) {
      workplaceService.otherName = this.form.get(`otherWorkplaceService${selectedWorkPlaceServiceId}`).value;
    }

    return workplaceService;
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.onSuccess();
      this.router.navigate([`${this.flow}/confirm-workplace-details`]);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  protected onSuccess(): void {}

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: [`${this.flow}/select-workplace-address`] });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
