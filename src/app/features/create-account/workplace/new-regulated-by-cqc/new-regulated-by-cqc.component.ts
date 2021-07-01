import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';

@Component({
  selector: 'app-new-regulated-by-cqc',
  templateUrl: './new-regulated-by-cqc.component.html',
})
export class NewRegulatedByCqcComponent implements OnInit {
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;
  public nextPage: URLStructure;
  private flow: string;

  constructor(
    private formBuilder: FormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private registrationService: RegistrationService,
    private backService: BackService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.setupForm();
    this.setupFormErrorsMap();
    this.setBackLinks();
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
            message: `Select yes if the main service you provide is regulated by the Care Quality Commission.`,
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
        console.log('inside yes');
        this.nextPage = { url: [this.flow, 'find-workplace'] };
      } else {
        console.log('inside no');
        this.nextPage = { url: [this.flow, 'workplace-name'] };
      }
      this.router.navigate(this.nextPage.url);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private setBackLinks(): void {
    const urlPage = this.flow === 'registration' ? 'create-account' : 'start';
    this.backService.setBackLink({ url: [this.flow, urlPage] });
  }
}
