import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CustomValidators } from '@shared/validators/custom-form-validators';

import { PasswordResetService } from '@core/services/password-reset.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html'
})
export class ChangePasswordEditComponent implements OnInit {
  public changePasswordForm: FormGroup;
  public displayError: boolean;
  private subscriptions: Subscription = new Subscription();
  @Input() userDetails: {};

  @Output() resetPasswordOutput = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private _userService: UserService,
    private _passwordResetService: PasswordResetService,
  ) { }

  // Get old password
  get getOldPasswordInput() {
    return this.changePasswordForm.get('oldPasswordInput');
  }

  // Get password group
  get getPasswordGroup() {
    return this.changePasswordForm.get('passwordGroup');
  }

  // Get create password
  get getCreateUsernameInput() {
    return this.changePasswordForm.get('passwordGroup.createPasswordInput');
  }

  // Get confirm password
  get getConfirmPasswordInput() {
    return this.changePasswordForm.get('passwordGroup.confirmPasswordInput');
  }

  ngOnInit() {
    this.changePasswordForm = this.fb.group({
      oldPasswordInput: ['', Validators.required],
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

    this.displayError = false;
  }

  resetPassword(data) {
    this.subscriptions.add(
      this._passwordResetService.changePassword(data).subscribe(res => {
        this.resetPasswordOutput.emit(res);
      })
    );
  }

  onSubmit() {
    if (this.changePasswordForm.invalid) {
      this.displayError = true;
    }
    else {
      const data = {
        currentPassword: this.changePasswordForm.value.oldPasswordInput,
        newPassword: this.changePasswordForm.value.passwordGroup.createPasswordInput
      };

      this.resetPassword(data);
    }

  }

}
