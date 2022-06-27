import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Roles } from '@core/model/roles.enum';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { AccountDetailsDirective } from '@shared/directives/user/account-details.directive';

@Component({
  selector: 'app-add-edit-users',
  templateUrl: 'add-edit-admin-users.component.html',
})
export class AddEditAdminUsersComponent extends AccountDetailsDirective {
  public callToActionLabel = 'Save admin user';
  public permissionsTypeRadios = [
    { label: 'Admin manager', permissionsQuestionValue: Roles.AdminManager },
    { label: 'Admin', permissionsQuestionValue: Roles.Admin },
  ];

  constructor(
    private breadcrumbService: BreadcrumbService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
    private adminUsersService: AdminUsersService,
  ) {
    super(backService, errorSummaryService, fb, router);
  }

  protected init(): void {
    this.breadcrumbService.show(JourneyType.ADMIN_USERS);
    this.return = { url: ['/sfcadmin', 'users'] };

    this.addFormControls();
  }

  private addFormControls(): void {
    this.form.addControl(
      'permissionsType',
      new FormControl(null, { validators: [Validators.required], updateOn: 'submit' }),
    );

    this.formErrorsMap.push({
      item: 'permissionsType',
      type: [
        {
          name: 'required',
          message: 'Select a permission',
        },
      ],
    });
  }

  protected save(): void {
    const newAdminUser = {
      ...this.form.value,
      role: this.form.get('permissionsType').value,
    };
    delete newAdminUser.permissionsType;

    this.adminUsersService.createAdminUser(newAdminUser).subscribe(
      () => this.router.navigate(this.return.url),
      (error: HttpErrorResponse) => this.onError(error),
    );
  }
}
