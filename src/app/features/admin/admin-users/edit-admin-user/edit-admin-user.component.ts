import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UserService } from '@core/services/user.service';
import { AccountDetailsDirective } from '@shared/directives/user/account-details.directive';

@Component({
  selector: 'app-edit-admin-user',
  templateUrl: 'edit-admin-user.component.html',
})
export class EditAdminUserComponent extends AccountDetailsDirective {
  public callToActionLabel = 'Save and return';
  public permissionsTypeRadios = [
    { label: 'Admin manager', permissionsQuestionValue: Roles.AdminManager },
    { label: 'Admin', permissionsQuestionValue: Roles.Admin },
  ];
  public title = 'Change admin user details';
  public user: UserDetails;
  private loggedInUser: UserDetails;

  constructor(
    private breadcrumbService: BreadcrumbService,
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
    private adminUsersService: AdminUsersService,
    private alertService: AlertService,
    private userService: UserService,
    protected route: ActivatedRoute,
  ) {
    super(backService, backLinkService, errorSummaryService, fb, router, route);
  }

  protected init(): void {
    this.user = this.route.snapshot.data.adminUser;
    this.loggedInUser = this.route.snapshot.data.loggedInUser;
    this.breadcrumbService.show(JourneyType.ADMIN_USERS);
    this.return = { url: ['/sfcadmin', 'users', this.user.uid] };

    this.addFormControls();
    this.prefillForm();
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

  protected prefillForm(): void {
    this.form.setValue({
      fullname: this.user.fullname,
      jobTitle: this.user.jobTitle,
      email: this.user.email,
      phone: this.user.phone,
      permissionsType: this.user.role,
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

    this.adminUsersService.updateAdminUserDetails(this.user.uid, newAdminUser).subscribe(
      (data) => {
        this.router.navigate(this.return.url);
        // if adminManager is editing their info, update the logged in user with new data
        if (this.loggedInUser.uid === data.uid) {
          this.userService.loggedInUser = { ...this.loggedInUser, ...data };
        }
        this.alertService.addAlert({
          type: 'success',
          message: `The user details for ${data.fullname} have been updated`,
        });
      },
      (error: HttpErrorResponse) => this.onError(error),
    );
  }
}
