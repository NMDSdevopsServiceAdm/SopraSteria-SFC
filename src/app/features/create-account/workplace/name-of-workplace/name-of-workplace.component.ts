import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';

@Component({
  selector: 'app-name-of-workplace',
  templateUrl: './name-of-workplace.component.html',
})
export class NameOfWorkplaceComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  private flow: string;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;
  public serverError: string;
  public workplace: Establishment;
  public isParent: boolean;

  constructor(
    private formBuilder: FormBuilder,
    public backService: BackService,
    protected router: Router,
    private route: ActivatedRoute,
    private errorSummaryService: ErrorSummaryService,
    private registrationService: RegistrationService,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.setupForm();
    this.setBackLink();
    this.workplace = this.establishmentService.primaryWorkplace;
    this.workplace?.isParent ? (this.isParent = true) : (this.isParent = false);
    this.setupFormErrorsMap();
  }

  public ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      workplaceName: [null, { validators: Validators.required, updateOn: 'submit' }],
    });
  }

  private setupFormErrorsMap(): void {
    let errorMessage;
    this.isParent
      ? (errorMessage = 'Enter the name of the workplace')
      : (errorMessage = 'Enter the name of your workplace');
    this.formErrorsMap = [
      {
        item: 'workplaceName',
        type: [{ name: 'required', message: errorMessage }],
      },
    ];
  }

  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: [`/${this.flow}`, 'new-regulated-by-cqc'] });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      this.registrationService.selectedLocationAddress$.next(this.getLocationAddress());
      this.router.navigate([this.flow, 'find-workplace-address']);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private getLocationAddress(): LocationAddress {
    return {
      addressLine1: null,
      addressLine2: null,
      addressLine3: null,
      county: null,
      locationName: this.form.get('workplaceName').value,
      postalCode: null,
      townCity: null,
    };
  }
}
