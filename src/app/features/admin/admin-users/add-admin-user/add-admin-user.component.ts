import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Roles } from '@core/model/roles.enum';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { AccountDetailsDirective } from '@shared/directives/user/account-details.directive';

@Component({
  selector: 'app-add-admin-user',
  templateUrl: 'add-admin-user.component.html',
})
export class AddAdminUserComponent extends AccountDetailsDirective {
  public callToActionLabel = 'Save admin user';
  public permissionsTypeRadios = [
    { label: 'Admin manager', permissionsQuestionValue: Roles.AdminManager },
    { label: 'Admin', permissionsQuestionValue: Roles.Admin },
  ];
  public title = 'Add admin user details';

  constructor(
    private breadcrumbService: BreadcrumbService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: UntypedFormBuilder,
    protected router: Router,
    private adminUsersService: AdminUsersService,
    private alertService: AlertService,
    protected route: ActivatedRoute,
  ) {
    super(backLinkService, errorSummaryService, fb, router, route);
  }

  protected init(): void {
    this.breadcrumbService.show(JourneyType.ADMIN_USERS);
    this.return = { url: ['/sfcadmin', 'users'] };
    this.addFormControls();
  }

  private addFormControls(): void {
    this.form.addControl(
      'permissionsType',
      new UntypedFormControl(null, { validators: [Validators.required], updateOn: 'submit' }),
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

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'fullname',
        type: [
          {
            name: 'required',
            message: 'Enter their full name',
          },
          {
            name: 'maxlength',
            message: 'Full name must be 120 characters or fewer',
          },
        ],
      },
      {
        item: 'jobTitle',
        type: [
          {
            name: 'required',
            message: 'Enter their job title',
          },
          {
            name: 'maxlength',
            message: 'Job title must be 120 characters or fewer',
          },
        ],
      },
      {
        item: 'email',
        type: [
          {
            name: 'required',
            message: 'Enter an email address',
          },
          {
            name: 'maxlength',
            message: 'Email address must be 120 characters or fewer',
          },
          {
            name: 'pattern',
            message: 'Enter the email address in the correct format, like name@example.com',
          },
        ],
      },
      {
        item: 'phone',
        type: [
          {
            name: 'required',
            message: 'Enter a phone number',
          },
          {
            name: 'pattern',
            message: 'Enter the phone number like 01632 960 001, 07700 900 982 or +44 0808 157 0192',
          },
        ],
      },
    ];
  }

  protected save(): void {
    const newAdminUser = {
      ...this.form.value,
      role: this.form.get('permissionsType').value,
    };
    delete newAdminUser.permissionsType;

    this.adminUsersService.createAdminUser(newAdminUser).subscribe(
      () => {
        this.router.navigate(this.return.url);
        this.alertService.addAlert({ type: 'success', message: 'Admin user has been added' });
      },
      (error: HttpErrorResponse) => this.onError(error),
    );
  }
}
