import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
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

  constructor(private formBuilder: UntypedFormBuilder, private errorSummaryService: ErrorSummaryService) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      usernameOrPassword: [null, { updateOn: 'submit' }],
    });
  }

  ngAfterViewInit(): void {}

  onSubmit(): void {}
}
