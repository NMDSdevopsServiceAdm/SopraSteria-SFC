import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Service, ServiceGroup } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { filter } from 'lodash';
import { Subscription } from 'rxjs';

export class SelectMainService implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl', { static: false }) formEl: ElementRef;
  protected allServices: Array<Service> = [];
  protected flow: string;
  protected otherServiceMaxLength = 120;
  protected selectedMainService: Service;
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
    this.init();
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.setSelectedWorkplaceService();
    this.getServiceCategories();
    this.init();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
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
            message: 'Select a main service.',
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

  protected getServiceCategories(): void {}

  protected setSelectedWorkplaceService(): void {}

  protected getServicesByCategory(isRegulated: boolean): void {
    this.subscriptions.add(
      this.workplaceService.getServicesByCategory(isRegulated).subscribe(
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
    if (this.selectedMainService && this.allServices.findIndex(s => s.id === this.selectedMainService.id) > -1) {
      this.form.get('workplaceService').patchValue(this.selectedMainService.id);

      if (this.selectedMainService.other && this.form.get(`otherWorkplaceService${this.selectedMainService.id}`)) {
        this.form.get(`otherWorkplaceService${this.selectedMainService.id}`).patchValue(this.selectedMainService.other);
      }
    }

    this.renderForm = true;
    this.errorSummaryService.formEl$.next(this.formEl);
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
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  protected onSuccess(): void {}

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  protected navigateToNextPage(): void {
    this.router.navigate([`${this.flow}/confirm-workplace-details`]);
  }

  get displayIntro() {
    return true;
  }

  get callToActionLabel() {
    return 'Continue';
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
