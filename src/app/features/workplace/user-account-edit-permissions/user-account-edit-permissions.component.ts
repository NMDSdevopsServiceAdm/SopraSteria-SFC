import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { RadioFieldData } from '@core/model/form-controls.model';
import { Roles } from '@core/model/roles.enum';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-account-edit-permissions',
  templateUrl: './user-account-edit-permissions.component.html',
})
export class UserAccountEditPermissionsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public establishment: Establishment;
  public user: UserDetails;
  public form: FormGroup;
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
  public roleRadios: RadioFieldData[] = [
    {
      value: Roles.Edit,
      label: 'Edit',
    },
    {
      value: Roles.Read,
      label: 'Read only',
    },
  ];
  public return: URLStructure;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private errorSummaryService: ErrorSummaryService,
    private userService: UserService,
    private alertService: AlertService
  ) {
    this.user = this.route.snapshot.data.user;
    this.establishment = this.route.parent.snapshot.data.establishment;

    this.return = { url: ['/workplace', this.establishment.uid], fragment: 'user-accounts' };
  }

  ngOnInit() {
    this.breadcrumbService.show();

    this.form = this.formBuilder.group({
      role: [this.user.role, Validators.required],
      primary: this.user.isPrimary,
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public onSubmit(payload: { action: string; save: boolean } = { action: 'continue', save: true }) {
    if (!payload.save) {
      return this.router.navigate(['/workplace', this.establishment.uid], { fragment: 'user-accounts' });
    }

    const { role, primary } = this.form.value;

    const props = {
      role,
      ...(role === Roles.Edit && {
        isPrimary: primary,
      }),
    };

    this.subscriptions.add(
      this.userService.updateUserDetails(this.user.uid, { ...this.user, ...props }).subscribe(
        data => {
          this.router.navigate(['/workplace', this.establishment.uid, 'user', this.user.uid], {
            fragment: 'user-accounts',
          });
          if (data.isPrimary) {
            this.alertService.addAlert({ type: 'success', message: `${this.user.fullname} is the new primary user` });
          }
        },
        error => this.onError(error)
      )
    );
  }

  private onError(error) {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }
}
