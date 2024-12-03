import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';

@Component({
  selector: 'app-forgot-your-username-or-password',
  templateUrl: './forgot-your-username-or-password.component.html',
  styleUrls: ['./forgot-your-username-or-password.component.scss'],
})
export class ForgotYourUsernameOrPasswordComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;

  private nextRoute: string[];

  constructor(private formBuilder: UntypedFormBuilder, private errorSummaryService: ErrorSummaryService) {}

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

  get usernameOrPassword(): AbstractControl {
    return this.form.get('usernameOrPassword');
  }

  onSubmit(): void {
    this.submitted = true;

    switch (this.usernameOrPassword.value) {
      case 'password':
        this.nextRoute = ['/forgot-your-password'];
        this.navigate();
        break;
      case 'username':
        this.nextRoute = ['/forgot-your-username'];
        this.navigate();
        break;
      default:
        return;
    }
  }

  navigate() {}
}
