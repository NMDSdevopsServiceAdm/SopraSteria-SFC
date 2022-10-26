import { AfterViewInit, Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';

@Directive()
export class NameOfWorkplaceDirective implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  public flow: string;
  public insideFlow: boolean;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;
  public serverError: string;
  public workplace: Establishment;
  public isParent: boolean;
  public workplaceSections: string[];
  public userAccountSections: string[];

  constructor(
    protected formBuilder: FormBuilder,
    public backService: BackService,
    protected backLinkService: BackLinkService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
    public workplaceInterfaceService: WorkplaceInterfaceService,
    protected establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.init();
    this.workplaceSections = ProgressBarUtil.workplaceProgressBarSections();
    this.userAccountSections = ProgressBarUtil.userProgressBarSections();
    this.setupForm();
    this.prefillForm();
    this.setBackLink();
    this.workplace = this.establishmentService.primaryWorkplace;
    this.workplace?.isParent ? (this.isParent = true) : (this.isParent = false);
    this.setupFormErrorsMap();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected init(): void {}

  public ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      workplaceName: [null, { validators: Validators.required, updateOn: 'submit' }],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected setupFormErrorsMap(): void {}

  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
    // this.backService.setBackLink({ url: [`/${this.flow}`, 'select-workplace-address'] });
  }

  public onSubmit(): void {
    this.submitted = true;
    this.workplaceInterfaceService.manuallyEnteredWorkplaceName$.next(true);

    if (this.form.valid) {
      this.setEnteredNameIntoFlowService();
      this.router.navigate([this.flow, 'type-of-employer']);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private setEnteredNameIntoFlowService(): void {
    const enteredWorkplaceName = this.form.get('workplaceName').value;
    this.workplaceInterfaceService.selectedLocationAddress$.value.locationName = enteredWorkplaceName;
  }

  protected prefillForm(): void {
    if (this.workplaceInterfaceService.selectedLocationAddress$.value.locationName) {
      this.form.setValue({
        workplaceName: this.workplaceInterfaceService.selectedLocationAddress$.value.locationName,
      });
    }
  }
}
