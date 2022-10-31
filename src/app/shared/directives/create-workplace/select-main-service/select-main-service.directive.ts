/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Service, ServiceGroup } from '@core/model/services.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';
import filter from 'lodash/filter';
import { Subscription } from 'rxjs';

@Directive()
export class SelectMainServiceDirective implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public isWorkPlaceUpdate: boolean;
  protected allServices: Array<Service> = [];
  public flow: string;
  protected otherServiceMaxLength = 120;
  protected selectedMainService: Service;
  protected serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  public categories: Array<ServiceGroup>;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public submitted = false;
  public returnToConfirmDetails: URLStructure;
  public isParent: boolean;
  public insideFlow: boolean;
  public workplaceSections: string[];
  public userAccountSections: string[];

  constructor(
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected workplaceService: WorkplaceService,
  ) {}

  ngOnInit(): void {
    this.init();
    this.workplaceSections = ProgressBarUtil.workplaceProgressBarSections();
    this.userAccountSections = ProgressBarUtil.userProgressBarSections();
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.setSelectedWorkplaceService();
    this.getServiceCategories();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      workplaceService: ['', { validators: Validators.required, updateOn: 'submit' }],
    });
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'workplaceService',
        type: [
          {
            name: 'required',
            message: 'Select your main service',
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
          this.categories.forEach((data: ServiceGroup) => {
            this.allServices.push(...data.services);
          });
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        },
        () => this.updateForm(),
      ),
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
          new FormControl(null, [Validators.maxLength(this.otherServiceMaxLength)]),
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
    if (this.selectedMainService && this.allServices.findIndex((s) => s.id === this.selectedMainService.id) > -1) {
      this.form.get('workplaceService').patchValue(this.selectedMainService.id);

      if (this.selectedMainService.other && this.form.get(`otherWorkplaceService${this.selectedMainService.id}`)) {
        this.form
          .get(`otherWorkplaceService${this.selectedMainService.id}`)
          .patchValue(this.selectedMainService.otherName);
      }
    }
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected getSelectedWorkPlaceService(): Service {
    const selectedWorkPlaceServiceId: number = parseInt(this.form.get('workplaceService').value, 10);
    const workplaceService: Service = filter(this.allServices, { id: selectedWorkPlaceServiceId })[0];

    if (workplaceService.isCQC === null) {
      workplaceService.isCQC = this.workplaceService.isCqcRegulated$.value;
    }

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

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  protected navigateToNextPage(): void {}

  get displayIntro() {
    return true;
  }

  get callToActionLabel() {
    return 'Continue';
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  serviceNotSelected(id: string): boolean {
    return !(<HTMLInputElement>document.getElementById(id)).checked;
  }
}
