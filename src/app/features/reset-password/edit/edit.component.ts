import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CustomValidators } from '@shared/validators/custom-form-validators';

import { PasswordResetService } from '@core/services/password-reset.service';

export interface successReset {
  text: string;
}
@Component({
  selector: 'app-rp-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class ResetPasswordEditComponent implements OnInit {
  public resetPasswordForm: FormGroup;
  @Input() validatePasswordResetResponse;
  @Input() headerToken: string;
  public name: string;
  public displayError: boolean;
  passwordMessage: string;
  confirmPasswordMessage: string;

  @Output() resetPasswordOutput = new EventEmitter();

  private passwordMessages = {
    minlength: 'Your password must be a minimum of 8 characters.',
    maxlength: 'Your password must be no longer than 50 characters.',
    required: 'Please enter your password.',
    pattern: 'Invalid password',
  };

  private confirmPasswordMessages = {
    required: 'Please confirm your password.',
    notMatched: 'Confirm Password does not match.',
  };

  constructor(
    private fb: FormBuilder,
    private _passwordResetService: PasswordResetService,
  ) { }

  // Get password group
  get getPasswordGroup() {
    return this.resetPasswordForm.get('passwordGroup');
  }

  // Get create password
  get getPasswordInput() {
    return this.resetPasswordForm.get('passwordGroup.createPasswordInput');
  }

  // Get confirm password
  get getConfirmPasswordInput() {
    return this.resetPasswordForm.get('passwordGroup.confirmPasswordInput');
  }

  ngOnInit() {
    this.resetPasswordForm = this.fb.group({
      passwordGroup: this.fb.group(
        {
          createPasswordInput: [
            '',
            [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,50}')],
          ],
          confirmPasswordInput: ['', [Validators.required]],
        },
        { validator: CustomValidators.matchInputValues }
      )
    });

    if (this.validatePasswordResetResponse && this.validatePasswordResetResponse.username) {
      this.name = this.validatePasswordResetResponse.username;
    }

    this.displayError = false;

  }

  setPasswordMessage(c: AbstractControl): void {
    this.passwordMessage = '';

    if (c.errors) {
      this.passwordMessage = Object.keys(c.errors)
        .map(key => (this.passwordMessage += this.passwordMessages[key]))
        .join(' ');
    }
  }

  setConfirmPasswordMessage(c: AbstractControl): void {
    this.confirmPasswordMessage = '';

    if (c.errors) {
      this.confirmPasswordMessage = Object.keys(c.errors)
        .map(key => (this.confirmPasswordMessage += this.confirmPasswordMessages[key]))
        .join(' ');
    }
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      this.displayError = true;
    }
    else {
      const newPassword = this.getPasswordInput.value;
      this._passwordResetService.resetPassword(newPassword, this.headerToken)
      .subscribe(res => {
        this.resetPasswordOutput.emit(res);
      });
    }

  }

}
