import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { RegistrationPayload } from '@core/model/registration.model';
import { SecurityDetails } from '@core/model/security-details.model';
import { Service } from '@core/model/services.model';
import { SummaryList } from '@core/model/summary-list.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-confirm-details',
  templateUrl: './confirm-details.component.html',
})
export class ConfirmDetailsComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public serverError: string;
  public submitted: boolean;
  public form: FormGroup;
  private formErrorsMap: Array<ErrorDetails>;
  private subscriptions: Subscription = new Subscription();
  protected termsAndConditionsCheckbox: boolean;
  protected service: Service;
  public userInfo: SummaryList[];
  public loginInfo: SummaryList[];
  public securityInfo: SummaryList[];
  public totalStaff: any;
  public loginCredentials: LoginCredentials;
  public securityDetails: SecurityDetails;
  protected locationAddress: LocationAddress;
  public userDetails: UserDetails;
  protected actionType: string;
  public isCqcRegulated: boolean;

  constructor(
    public registrationService: RegistrationService,
    public backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.setupForm();
    this.setupFormErrorsMap();
    this.prefillForm();
    this.setupSubscriptions();
    this.setBackLink();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: ['registration', 'create-security-question'] });
  }

  private setupSubscriptions(): void {
    const c1 = combineLatest([
      this.userService.userDetails$,
      this.registrationService.isCqcRegulated$,
      this.registrationService.selectedLocationAddress$,
      this.registrationService.selectedWorkplaceService$,
      this.registrationService.loginCredentials$,
      this.registrationService.securityDetails$,
    ]);
    const c2 = combineLatest([this.registrationService.totalStaff$]);
    const c3 = combineLatest([c1, c2]).pipe(
      map(
        ([
          [userDetails, isCqcRegulated, locationAddress, service, loginCredentials, securityDetails],
          [totalStaff],
        ]) => {
          return {
            userDetails,
            isCqcRegulated,
            locationAddress,
            service,
            loginCredentials,
            securityDetails,
            totalStaff,
          };
        },
      ),
    );
    this.subscriptions.add(
      c3.subscribe((res) => {
        this.userDetails = res.userDetails;
        this.isCqcRegulated = res.isCqcRegulated;
        this.locationAddress = res.locationAddress;
        this.service = res.service;
        this.loginCredentials = res.loginCredentials;
        this.securityDetails = res.securityDetails;
        this.totalStaff = res.totalStaff;
      }),
    );
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.save();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private generatePayload(): Array<RegistrationPayload> {
    const payload: any = this.locationAddress;
    payload.locationId = this.service.isCQC ? this.locationAddress.locationId : null;
    payload.mainService = this.service.name;
    payload.mainServiceOther = this.service.otherName ? this.service.otherName : null;
    payload.isRegulated = this.isCqcRegulated;
    payload.user = this.userDetails;
    payload.user.username = this.loginCredentials.username;
    payload.user.password = this.loginCredentials.password;
    payload.user.securityQuestion = this.securityDetails.securityQuestion;
    payload.user.securityQuestionAnswer = this.securityDetails.securityQuestionAnswer;
    payload.totalStaff = this.totalStaff;

    return [payload];
  }

  public save(): void {
    this.generatePayload();
    this.subscriptions.add(
      this.registrationService.postRegistration(this.generatePayload()).subscribe(
        (registration) =>
          registration.userstatus === 'PENDING'
            ? this.router.navigate(['/registration/thank-you'])
            : this.router.navigate(['/registration/complete']),
        (error: HttpErrorResponse) => this.onError(error),
      ),
    );
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      termsAndConditions: [null, Validators.required],
    });
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'termsAndConditions',
        type: [
          {
            name: 'required',
            message: 'Confirm that you agree to the terms and conditions',
          },
        ],
      },
    ];
  }

  protected prefillForm(): void {
    this.termsAndConditionsCheckbox = this.registrationService.termsAndConditionsCheckbox$.value;
    if (this.termsAndConditionsCheckbox) {
      this.form.patchValue({
        termsAndConditions: 'check',
      });
    }
  }

  public setTermsAndConditionsCheckbox() {
    this.registrationService.termsAndConditionsCheckbox$.next(!this.termsAndConditionsCheckbox);
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  protected onError(error: HttpErrorResponse): void {
    console.error(error);
    this.router.navigate(['/problem-with-the-service']);
  }
}
