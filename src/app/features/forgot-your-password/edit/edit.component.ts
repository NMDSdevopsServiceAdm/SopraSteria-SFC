import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { RequestPasswordResetResponse } from '@core/services/password-reset.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fp-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class ForgotYourPasswordEditComponent implements OnInit {
  public forgotPasswordForm: FormGroup;
  public forgottenPasswordMessage: boolean;

  @Output() formDataOutput = new EventEmitter<RequestPasswordResetResponse>();

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {

    this.forgotPasswordForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required, Validators.maxLength(120)]],
    });

    this.forgottenPasswordMessage = false;
  }

  onSubmit() {

    const usernameOrEmail = this.forgotPasswordForm.value;

    if (this.forgotPasswordForm.invalid) {

      this.forgottenPasswordMessage = true;
    }
    else {
      this.formDataOutput.emit(usernameOrEmail);
    }
  }

}
