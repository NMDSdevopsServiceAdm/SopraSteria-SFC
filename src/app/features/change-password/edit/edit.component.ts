import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CustomValidators } from '@shared/validators/custom-form-validators';

import { PasswordResetService } from '@core/services/password-reset.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';
import { UserDetails } from '@core/model/userDetails.model';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
})
export class ChangePasswordEditComponent implements OnInit {
  public form: FormGroup;
  public displayError: boolean;
  private subscriptions: Subscription = new Subscription();
  @Input() userDetails: UserDetails;
  @Output() resetPasswordEvent = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private passwordResetService: PasswordResetService
  ) {}

  // Get old password
  get getOldPasswordInput() {
    return this.form.get('oldPasswordInput');
  }

  // Get password group
  get getPasswordGroup() {
    return this.form.get('passwordGroup');
  }

  // Get create password
  get getCreateUsernameInput() {
    return this.form.get('passwordGroup.createPasswordInput');
  }

  // Get confirm password
  get getConfirmPasswordInput() {
    return this.form.get('passwordGroup.confirmPasswordInput');
  }

  ngOnInit() {
    this.form = this.fb.group({
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
      ),
    });

    this.displayError = false;
  }

  private resetPassword(data: Object): void {
    this.subscriptions.add(
      this.passwordResetService.changePassword(data).subscribe(() => this.resetPasswordEvent.emit())
    );
  }

  onSubmit() {
    if (this.form.invalid) {
      this.displayError = true;
    } else {
      const data = {
        currentPassword: this.form.value.oldPasswordInput,
        newPassword: this.form.value.passwordGroup.createPasswordInput,
      };

      this.resetPassword(data);
    }
  }
}
