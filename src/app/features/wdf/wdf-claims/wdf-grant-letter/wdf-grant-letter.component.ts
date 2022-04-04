import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { EMAIL_PATTERN } from '@core/constants/constants';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { GrantLetterService } from '@core/services/wdf-claims/wdf-grant-letter.service';
import { User } from '@sentry/browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wdf-grant-letter',
  templateUrl: './wdf-grant-letter.component.html',
})
export class WdfGrantLetterComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public options = ['Myself', 'Somebody else in the organisation'];

  public workplace: Establishment;
  public form: FormGroup;
  public submitted = false;
  public submittedWithFields = false;
  public formErrorsMap: ErrorDetails[] = [];
  public showNameAndEmailMyself = false;
  public showNameAndEmailSomebody = false;
  public showNameAndEmail = false;
  public loggedInUser: User;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private router: Router,
    private grantLetterService: GrantLetterService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.setupForm();
    this.setupFormErrorsMap();
    this.loggedInUser = this.route.snapshot.data.loggedInUser;
    this.workplace = this.route.snapshot.data.primaryWorkplace;
    this.breadcrumbService.show(JourneyType.WDF_CLAIMS);
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      grantLetter: [
        null,
        {
          validators: Validators.required,
          updateOn: 'submit',
        },
      ],
    });
  }

  onChange(answer: string): void {
    let fullName, email;
    if (answer === this.options[0]) {
      this.showNameAndEmailMyself = true;
      this.showNameAndEmailSomebody = false;

      fullName = this.loggedInUser.fullname;
      email = this.loggedInUser.email;
    } else {
      this.showNameAndEmailMyself = false;
      this.showNameAndEmailSomebody = true;

      fullName = null;
      email = null;
    }
    this.removeControl();
    this.addControl(fullName, email);

    // this.newFormErrorsMap();
    // this.formErrorsMap.length === 1 && this.newFormErrorsMap();
  }

  public onSubmit(): void {
    this.submittedWithFields = this.form.controls.fullName && this.form.controls.emailAddress ? true : false;
    this.submitted = true;
    this.submittedWithFields && this.setupFormErrorsMap();
    this.errorSummaryService.syncFormErrorsEvent.next(true);
    if (this.form.valid) {
      this.subscriptions.add(
        this.grantLetterService.sendEmailGrantLetter(this.workplace.uid, this.form.value).subscribe(),
      );
      this.navigateToNextPage();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'grantLetter',
        type: [
          {
            name: 'required',
            message: 'Select who you want to email the grant letter to',
          },
        ],
      },
      {
        item: 'fullName',
        type: [
          {
            name: 'required',
            message: this.submittedWithFields ? 'Enter a full name' : '',
          },
        ],
      },
      {
        item: 'emailAddress',
        type: [
          {
            name: 'required',
            message: this.submittedWithFields ? 'Enter an email address' : '',
          },
          {
            name: 'pattern',
            message: this.submittedWithFields
              ? 'Enter the email address in the correct format, like name@example.com'
              : '',
          },
        ],
      },
    ];
  }

  private newFormErrorsMap(): void {
    this.formErrorsMap.push(
      {
        item: 'fullName',
        type: [
          {
            name: 'required',
            message: 'Enter a full name',
          },
        ],
      },
      {
        item: 'emailAddress',
        type: [
          {
            name: 'required',
            message: 'Enter an email address',
          },
          {
            name: 'pattern',
            message: 'Enter the email address in the correct format, like name@example.com',
          },
        ],
      },
    );
  }

  private addControl(fullName?: string, email?: string): void {
    this.form.addControl(
      'fullName',
      new FormControl(fullName, {
        validators: [Validators.required, Validators.maxLength(120)],
        updateOn: 'submit',
      }),
    );
    this.form.addControl(
      'emailAddress',
      new FormControl(email, {
        validators: [Validators.required, Validators.pattern(EMAIL_PATTERN), Validators.maxLength(120)],
        updateOn: 'submit',
      }),
    );
  }

  private removeControl(): void {
    this.form.removeControl('fullName');
    this.form.removeControl('emailAddress');
  }

  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public navigateToNextPage(): void {
    this.router.navigate(['wdf-claims', 'grant-letter', 'grant-letter-sent'], {
      state: {
        name: this.form.value.fullName,
        email: this.form.value.emailAddress,
        myself: this.form.value.grantLetter,
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
