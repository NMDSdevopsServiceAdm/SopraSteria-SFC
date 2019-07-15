import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RadioFieldData } from '@core/model/form-controls.model';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { AccountDetails } from '@features/account/account-details/account-details';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
})
export class CreateAccountComponent extends AccountDetails {
  public callToActionLabel = 'Save user account';
  public roleRadios: RadioFieldData[] = [
    {
      value: 'Edit',
      label: 'Edit',
    },
    {
      value: 'Read',
      label: 'Read-only',
    },
  ];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private createAccountService: CreateAccountService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router
  ) {
    super(backService, errorSummaryService, fb, router);
  }

  protected init(): void {
    this.breadcrumbService.show();
    this.addFormControls();
  }

  private addFormControls(): void {
    this.form.addControl('role', new FormControl(null, Validators.required));

    this.formErrorsMap.push({
      item: 'role',
      type: [
        {
          name: 'required',
          message: 'Please specify permissions for the new account.',
        },
      ],
    });
  }

  protected save() {
    this.subscriptions.add(
      this.createAccountService.createAccount(this.form.value).subscribe(() => {
        this.router.navigate(['/create-account/saved']);
      })
    );
  }
}
