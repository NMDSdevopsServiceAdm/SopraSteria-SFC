import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { SanitizePostcodeUtil } from '@core/utils/sanitize-postcode-util';

@Component({
  selector: 'app-new-workplace-not-found',
  templateUrl: './new-workplace-not-found.component.html',
})
export class NewWorkplaceNotFoundComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public submitted: boolean;
  public workplace: Establishment;
  public isParent: boolean;
  public postcodeOrLocationId: string;
  private searchMethod: string;
  private flow: string;

  constructor(
    private establishmentService: EstablishmentService,
    private formBuilder: FormBuilder,
    public backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private registrationService: RegistrationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.workplace = this.establishmentService.primaryWorkplace;
    this.isParent = this.workplace?.isParent ? true : false;
    this.sanitizePostcode();
    this.setupForm();
    this.setupFormErrorsMap();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public sanitizePostcode(): void {
    this.postcodeOrLocationId = this.registrationService.postcodeOrLocationId$.value;
    this.searchMethod = this.registrationService.searchMethod$.value;

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
            message: `Select yes if you want to try a different location ID or postcode.`,
          },
        ],
      },
    ];
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: [this.flow, 'find-workplace'] });
  }

  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit() {
    this.submitted = true;

    if (this.form.valid) {
      const useDifferentLocationIdOrPostcode = this.form.get('useDifferentLocationIdOrPostcode');
      if (useDifferentLocationIdOrPostcode.value === 'yes') {
        this.registrationService.useDifferentLocationIdOrPostcode$.next(true);
        this.router.navigate([`/${this.flow}`, 'find-workplace']);
      } else {
        this.router.navigate([`/${this.flow}`, 'workplace-name-address']);
      }
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }
}
