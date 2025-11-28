import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';

@Component({
    selector: 'app-forgot-your-username-or-password',
    templateUrl: './forgot-your-username-or-password.component.html',
    standalone: false
})
export class ForgotYourUsernameOrPasswordComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;

  private nextRoute: string[];

  constructor(
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      usernameOrPassword: [null, { updateOn: 'submit', validators: Validators.required }],
    });
    this.setupFormErrorsMap();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'usernameOrPassword',
        type: [
          {
            name: 'required',
            message: 'Select username or password',
          },
        ],
      },
    ];
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  onSubmit(): void {
    this.submitted = true;

    const selectedOption = this.form.get('usernameOrPassword').value;

    switch (selectedOption) {
      case 'username':
        this.nextRoute = ['/forgot-your-username'];
        break;
      case 'password':
        this.nextRoute = ['/forgot-your-password'];
        break;
      default:
        return;
    }

    this.router.navigate(this.nextRoute);
  }
}
