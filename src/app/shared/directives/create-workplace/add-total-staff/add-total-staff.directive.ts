import { AfterViewInit, Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TotalStaffFormService } from '@core/services/total-staff-form.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';

@Directive()
export class AddTotalStaffDirective implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  protected serverErrorsMap: Array<ErrorDefinition>;
  public submitted = false;
  public return: URLStructure;
  public form: FormGroup;
  public serverError: string;
  public formErrorsMap: Array<ErrorDetails>;
  public workplaceTotalStaff;
  public isParent: boolean;
  public flow: string;
  public returnToConfirmDetails: URLStructure;
  public workplace: Establishment;
  public appDetailTitle = '';
  public workplaceSections: string[];
  public userAccountSections: string[];
  public insideFlow: boolean;

  constructor(
    protected router: Router,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected route: ActivatedRoute,
    protected formBuilder: FormBuilder,
    protected workplaceInterfaceService: WorkplaceInterfaceService,
    public totalStaffFormService: TotalStaffFormService,
    public establishmentService: EstablishmentService,
  ) {
    this.form = totalStaffFormService.createForm(formBuilder, true);
  }

  public ngOnInit(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.init();
    this.workplaceSections = ProgressBarUtil.workplaceProgressBarSections();
    this.userAccountSections = ProgressBarUtil.userProgressBarSections();
    this.returnToConfirmDetails = this.workplaceInterfaceService.returnTo$.value;
    this.setBackLink();
    this.setupFormErrors();
    this.workplaceTotalStaff = this.workplaceInterfaceService.totalStaff$.value;
    this.prefillForm();
    this.workplace = this.establishmentService.primaryWorkplace;
    this.isParent = this.workplace?.isParent;
    this.appDetailTitle = `Not sure how many members of staff ${this.isParent ? 'the' : 'your'} workplace has?`;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected init(): void {}

  public ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected prefillForm(): void {
    if (this.workplaceTotalStaff) {
      this.form.setValue({
        totalStaff: this.workplaceTotalStaff,
      });
    }
  }

  public onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      const totalStaff = this.form.get('totalStaff').value;
      this.workplaceInterfaceService.totalStaff$.next(totalStaff);
      this.navigateToNextPage();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected navigateToNextPage(): void {}

  private setupFormErrors(): void {
    this.formErrorsMap = this.totalStaffFormService.createFormErrorsMap();
  }
  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected setBackLink(): void {}
}
