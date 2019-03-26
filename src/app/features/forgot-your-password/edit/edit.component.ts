import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestPasswordResetResponse } from '@core/services/password-reset.service';

@Component({
  selector: 'app-fp-edit',
  templateUrl: './edit.component.html',
})
export class ForgotYourPasswordEditComponent implements OnInit {
  public form: FormGroup;
  public submitted = false;

  @Output() formDataOutput = new EventEmitter<RequestPasswordResetResponse>();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      usernameOrEmail: ['', [Validators.required, Validators.maxLength(120)]],
    });
  }

  onSubmit() {
    const { usernameOrEmail } = this.form.controls;

    this.submitted = true;

    if (this.form.valid) {
      this.formDataOutput.emit(usernameOrEmail.value);
    }
  }
}
