import { AfterViewInit, Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';
import { SanitizePostcodeUtil } from '@core/utils/sanitize-postcode-util';

@Directive()
export class NewWorkplaceNotFoundDirective implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public submitted: boolean;
  public workplace: Establishment;
  public isParent: boolean;
  public postcodeOrLocationId: string;
  protected searchMethod: string;
  public flow: string;
  public insideFlow: boolean;
  public workplaceSections: string[];
  public userAccountSections: string[];

  constructor(
    protected establishmentService: EstablishmentService,
    protected formBuilder: FormBuilder,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workplaceInterfaceService: WorkplaceInterfaceService,
    protected router: Router,
    protected route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.workplaceSections = ProgressBarUtil.workplaceProgressBarSections();
    this.userAccountSections = ProgressBarUtil.userProgressBarSections();
    this.workplace = this.establishmentService.primaryWorkplace;
    this.init();
    this.sanitizePostcode();
    this.setBackLink();
    this.setupForm();
    this.setupFormErrorsMap();
    this.prefillForm();
    this.workplaceInterfaceService.useDifferentLocationIdOrPostcode$.next(null);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected init(): void {}

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public sanitizePostcode(): void {
    this.postcodeOrLocationId = this.workplaceInterfaceService.postcodeOrLocationId$.value;
    this.searchMethod = this.workplaceInterfaceService.searchMethod$.value;

    if (this.searchMethod === 'postcode') {
      this.postcodeOrLocationId = SanitizePostcodeUtil.sanitizePostcode(this.postcodeOrLocationId);
    }
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      useDifferentLocationIdOrPostcode: [null, { validators: Validators.required, updateOn: 'submit' }],
    });
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'useDifferentLocationIdOrPostcode',
        type: [
          {
            name: 'required',
            message: `Select yes if you want to try a different location ID or postcode`,
          },
        ],
      },
    ];
  }

  protected prefillForm(): void {
    const useDifferentLocationIdOrPostcode = this.workplaceInterfaceService.useDifferentLocationIdOrPostcode$.value;
    if (useDifferentLocationIdOrPostcode !== null) {
      const radioButton = useDifferentLocationIdOrPostcode ? 'yes' : 'no';
      this.form.patchValue({
        useDifferentLocationIdOrPostcode: radioButton,
      });
    }
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: [this.flow, 'find-workplace'] });
  }

  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      const radioButton = this.form.get('useDifferentLocationIdOrPostcode');
      this.workplaceInterfaceService.workplaceNotFound$.next(true);
      if (radioButton.value === 'yes') {
        this.router.navigate([`/${this.flow}`, 'find-workplace']);
        this.workplaceInterfaceService.useDifferentLocationIdOrPostcode$.next(true);
      } else {
        this.router.navigate([`/${this.flow}`, 'workplace-name-address']);
        this.workplaceInterfaceService.useDifferentLocationIdOrPostcode$.next(false);
      }
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }
}
