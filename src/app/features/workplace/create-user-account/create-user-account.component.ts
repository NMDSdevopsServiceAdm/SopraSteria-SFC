import { AccountDetails } from '@features/account/account-details/account-details';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { Component } from '@angular/core';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RadioFieldData } from '@core/model/form-controls.model';
import { Roles } from '@core/model/roles.enum';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-user-account.component.html',
})
export class CreateUserAccountComponent extends AccountDetails {
  public callToActionLabel = 'Save user account';
  public establishmentUid: string;
  public roleRadios: RadioFieldData[] = [
    {
      value: Roles.Edit,
      label: 'Edit',
    },
    {
      value: Roles.Read,
      label: 'Read-only',
    },
  ];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private createAccountService: CreateAccountService,
    private route: ActivatedRoute,
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
    this.establishmentUid = this.route.snapshot.params.establishmentUid;
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
      this.createAccountService
        .createAccount(this.establishmentUid, this.form.value)
        .subscribe(
          () => this.router.navigate(['/workplace', this.establishmentUid, 'user/saved']),
          (error: HttpErrorResponse) => this.onError(error)
        )
    );
  }
}
