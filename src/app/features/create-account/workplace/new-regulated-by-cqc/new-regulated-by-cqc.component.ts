import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';

@Component({
  selector: 'app-new-regulated-by-cqc',
  templateUrl: './new-regulated-by-cqc.component.html',
})
export class NewRegulatedByCqcComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;
  private flow: string;

  constructor(
    private formBuilder: FormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private registrationService: RegistrationService,
    public backService: BackService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.setupForm();
    this.setupFormErrorsMap();
    this.setBackLink();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      regulatedByCQC: [null, Validators.required],
    });
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'regulatedByCQC',
        type: [
          {
            name: 'required',
            message: `Select yes if the main service you provide is regulated by the Care Quality Commission`,
          },
        ],
      },
    ];
  }

  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    const regulatedByCQC = this.form.get('regulatedByCQC');

    this.submitted = true;
    this.registrationService.isRegulated$.next(regulatedByCQC.value === 'yes');
    this.registrationService.isCqcRegulated$.next(regulatedByCQC.value === 'yes');
    this.registrationService.registrationInProgress$.next(true);

    if (this.form.valid) {
      if (regulatedByCQC.value === 'yes') {
        this.router.navigate([`/${this.flow}`, 'find-workplace']);
      } else {
        this.router.navigate([`/${this.flow}`, 'workplace-name']);
      }
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  public setBackLink(): void {
    const urlPage = this.flow === 'registration' ? 'create-account' : 'start';
    this.backService.setBackLink({ url: [`/${this.flow}`, urlPage] });
  }
}
