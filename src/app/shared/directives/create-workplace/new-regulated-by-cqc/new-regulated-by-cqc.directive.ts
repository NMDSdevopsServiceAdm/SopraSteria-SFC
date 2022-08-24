import { AfterViewInit, Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';

@Directive()
export class NewRegulatedByCqcDirective implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;
  protected flow: string;
  protected isCqcRegulated: boolean;
  public workplaceSections: string[];
  public userAccountSections: string[];
  public insideFlow: boolean;

  constructor(
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected workplaceInterfaceService: WorkplaceInterfaceService,
    public backService: BackService,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.init();
    console.log(this.flow);
    this.workplaceSections = ProgressBarUtil.workplaceProgressBarSections();
    this.userAccountSections = ProgressBarUtil.userProgressBarSections();
    this.isCqcRegulated = this.workplaceInterfaceService.isCqcRegulated$.value;
    this.setupForm();
    this.setupFormErrorsMap();
    this.prefillForm();
    this.setBackLink();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      regulatedByCQC: [null, { validators: Validators.required, updateOn: 'submit' }],
    });
  }

  protected init(): void {}

  protected setupFormErrorsMap(): void {
    const flowWording = this.flow === 'registration' ? 'you provide' : 'it provides';
    this.formErrorsMap = [
      {
        item: 'regulatedByCQC',
        type: [
          {
            name: 'required',
            message: `Select yes if the main service ${flowWording} is regulated by the Care Quality Commission`,
          },
        ],
      },
    ];
  }

  protected prefillForm(): void {
    if (this.isCqcRegulated !== null) {
      const selectedRadioButton = this.isCqcRegulated ? 'yes' : 'no';
      this.form.patchValue({
        regulatedByCQC: selectedRadioButton,
      });
    }
  }

  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    console.log('1');
    const regulatedByCQC = this.form.get('regulatedByCQC');

    this.submitted = true;
    this.workplaceInterfaceService.isRegulated$.next(regulatedByCQC.value === 'yes');
    this.workplaceInterfaceService.isCqcRegulated$.next(regulatedByCQC.value === 'yes');
    this.setFlowToInProgress();

    console.log('*****');
    console.log(this.form);
    if (this.form.valid) {
      console.log('form valid');
      console.log(this.flow);
      if (regulatedByCQC.value === 'yes') {
      this.router.navigate([`/${this.flow}`, 'find-workplace']);
      } else {
        console.log('should navigate here');
        this.router.navigate([`/${this.flow}`, 'find-workplace-address']);
      }
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  public setBackLink(): void {
    const urlPage = this.flow === 'registration' ? 'create-account' : 'start';
    this.backService.setBackLink({ url: [`/${this.flow}`, urlPage] });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected setFlowToInProgress(): void {}
}
