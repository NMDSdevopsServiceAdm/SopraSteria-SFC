import { BackService } from '@core/services/back.service';
import { Component } from '@angular/core';
import { CreateUsername } from '@features/account/create-username/create-username';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder } from '@angular/forms';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-username',
  templateUrl: './create-username.component.html',
})
export class CreateUsernameComponent extends CreateUsername {
  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected registrationService: RegistrationService,
    protected router: Router
  ) {
    super(backService, errorSummaryService, formBuilder, registrationService, router);
  }
}
