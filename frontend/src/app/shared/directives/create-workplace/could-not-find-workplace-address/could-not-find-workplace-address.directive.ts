import { Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';

@Directive()
export class CouldNotFindWorkplaceAddressDirective implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public invalidPostcodeEntered: string;
  public workplace: Establishment;
  public isParent: boolean;
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted: boolean;
  public insideFlow: boolean;
  public flow: string;
  public workplaceSections: string[];
  public userAccountSections: string[];

  constructor(
    protected workplaceInterfaceService: WorkplaceInterfaceService,
    public backService: BackService,
    protected establishmentService: EstablishmentService,
    protected formBuilder: UntypedFormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected router: Router,
    protected route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.init();
    this.workplaceSections = ProgressBarUtil.workplaceProgressBarSections();
    this.userAccountSections = ProgressBarUtil.userProgressBarSections();
    this.flow = this.route.snapshot.parent.url[0].path;
    this.workplace = this.establishmentService.primaryWorkplace;
    this.isParent = this.workplace?.isParent;
    this.setBackLink();
    this.setupForm();
    this.setupFormErrorsMap();
    this.prefillForm();
    this.invalidPostcodeEntered = this.workplaceInterfaceService.invalidPostcodeEntered$.value;
    this.workplaceInterfaceService.useDifferentLocationIdOrPostcode$.next(null);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected init(): void {}

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: [this.flow, 'find-workplace-address'] });
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      useDifferentPostcode: [null, { validators: Validators.required, updateOn: 'submit' }],
    });
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'useDifferentPostcode',
        type: [
          {
            name: 'required',
            message: `Select yes if you want to try a different postcode`,
          },
        ],
      },
    ];
  }

  protected prefillForm(): void {
    const useDifferentPostcode = this.workplaceInterfaceService.useDifferentLocationIdOrPostcode$.value;
    if (useDifferentPostcode !== null) {
      const radioButton = useDifferentPostcode ? 'yes' : 'no';
      this.form.patchValue({
        useDifferentPostcode: radioButton,
      });
    }
  }

  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      const radioButton = this.form.get('useDifferentPostcode');
      this.workplaceInterfaceService.workplaceNotFound$.next(true);
      if (radioButton.value === 'yes') {
        this.router.navigate([this.flow, 'find-workplace-address']);
        this.workplaceInterfaceService.useDifferentLocationIdOrPostcode$.next(true);
      } else {
        this.router.navigate([this.flow, 'workplace-name-address']);
        this.workplaceInterfaceService.useDifferentLocationIdOrPostcode$.next(false);
      }
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }
}
