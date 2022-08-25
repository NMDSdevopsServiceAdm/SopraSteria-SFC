/* eslint-disable @typescript-eslint/no-empty-function */
import { AfterViewInit, Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';

@Directive()
export class TypeOfEmployerDirective implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  public flow: string;
  public form: FormGroup;
  public formErrorsMap: ErrorDetails[];
  public submitted = false;
  public serverError: string;
  public isRegulated: boolean;
  public returnToConfirmDetails: URLStructure;
  public showOtherInputField = false;
  private maxLength = 120;
  public options = [
    { value: 'Local Authority (adult services)', text: 'Local authority (adult services)' },
    { value: 'Local Authority (generic/other)', text: 'Local authority (generic, other)' },
    { value: 'Private Sector', text: 'Private sector' },
    { value: 'Voluntary / Charity', text: 'Voluntary, charity, not for profit' },
    { value: 'Other', text: 'Other' },
  ];
  public workplaceSections: string[];
  public userAccountSections: string[];
  public insideFlow: boolean;

  constructor(
    protected formBuilder: FormBuilder,
    public backService: BackService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
    protected workplaceInterfaceService: WorkplaceInterfaceService,
  ) {}

  ngOnInit(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.init();
    this.workplaceSections = ProgressBarUtil.workplaceProgressBarSections();
    this.userAccountSections = ProgressBarUtil.userProgressBarSections();
    this.setupForm();
    this.setupFormErrorsMap();
    this.prefillForm();
    this.setBackLink();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        employerType: ['', Validators.required],
        other: [null, Validators.maxLength(this.maxLength)],
      },
      { updateOn: 'submit' },
    );
  }

  protected init(): void {}
  protected navigateToNextPage(): void {}

  public setBackLink(): void {
    if (this.returnToConfirmDetails) {
      this.backService.setBackLink({ url: [this.flow] });
      return;
    }

    const route = this.isRegulated ? this.getCQCRegulatedBackLink() : this.getNonCQCRegulatedBackLink();
    this.backService.setBackLink({ url: [this.flow, route] });
  }

  protected getCQCRegulatedBackLink(): string {
    if (this.workplaceInterfaceService.manuallyEnteredWorkplace$.value) {
      return 'workplace-name-address';
    }
    if (this.workplaceInterfaceService.locationAddresses$.value.length == 1) {
      return 'your-workplace';
    }
    if (this.workplaceInterfaceService.locationAddresses$.value.length > 1) {
      return 'select-workplace';
    }
  }

  protected getNonCQCRegulatedBackLink(): string {
    if (this.workplaceInterfaceService.manuallyEnteredWorkplace$.value) {
      return 'workplace-name-address';
    }
    if (this.workplaceInterfaceService.manuallyEnteredWorkplaceName$.value) {
      return 'workplace-name';
    }
    return 'select-workplace-address';
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'employerType',
        type: [
          {
            name: 'required',
            message: 'Select the type of employer',
          },
        ],
      },
      {
        item: 'other',
        type: [
          {
            name: 'maxlength',
            message: `Other Employer type must be ${this.maxLength} characters or less`,
          },
        ],
      },
    ];
  }

  protected getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.generateUpdateProps();
      const url = this.returnToConfirmDetails ? [this.flow] : [this.flow, 'select-main-service'];
      this.router.navigate(url);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private generateUpdateProps(): void {
    const { employerType, other } = this.form.value;

    const employerTypeObject = {
      value: employerType,
      ...(employerType === 'Other' && { other }),
    };

    this.workplaceInterfaceService.typeOfEmployer$.next(employerTypeObject);
  }

  private prefillForm(): void {
    if (this.workplaceInterfaceService.typeOfEmployer$.value) {
      this.showOtherInputField = !!this.workplaceInterfaceService.typeOfEmployer$.value.other;
      this.form.setValue({
        employerType: this.workplaceInterfaceService.typeOfEmployer$.value.value,
        other: this.showOtherInputField ? this.workplaceInterfaceService.typeOfEmployer$.value.other : null,
      });
    }
  }

  protected onOtherSelect(radioValue: string): void {
    this.showOtherInputField = radioValue === 'Other';
  }
}
