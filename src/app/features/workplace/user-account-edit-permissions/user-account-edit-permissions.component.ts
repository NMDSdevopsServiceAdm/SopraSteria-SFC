import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { RadioFieldData } from '@core/model/form-controls.model';
import { Roles } from '@core/model/roles.enum';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

import {
  UserAccountChangePrimaryDialogComponent,
} from '../user-account-change-primary-dialog/user-account-change-primary-dialog.component';

@Component({
  selector: 'app-user-account-edit-permissions',
  templateUrl: './user-account-edit-permissions.component.html',
})
export class UserAccountEditPermissionsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public workplace: Establishment;
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
  public submitted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private errorSummaryService: ErrorSummaryService,
    private dialogService: DialogService,
    private userService: UserService,
    private alertService: AlertService,
    private establishmentService: EstablishmentService
  ) {
    this.user = this.route.snapshot.data.user;
    this.workplace = this.route.parent.snapshot.data.establishment;

    this.return = {
      url:
        this.route.snapshot.data.primaryWorkplace &&
        this.workplace.uid === this.route.snapshot.data.primaryWorkplace.uid
          ? ['/dashboard']
          : ['/workplace', this.workplace.uid],
      fragment: 'user-accounts',
    };
  }

  ngOnInit() {
    this.setupServerErrorsMap();
    const journey = this.establishmentService.isOwnWorkplace() ? JourneyType.MY_WORKPLACE : JourneyType.ALL_WORKPLACES;
    this.breadcrumbService.show(journey);

    this.form = this.formBuilder.group({
      role: [this.user.role, Validators.required],
      primary: this.user.isPrimary,
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'Cannot update user permissions as too many of that role already exist.',
      },
    ];
  }

  public changePrimary() {
    const dialog = this.dialogService.open(UserAccountChangePrimaryDialogComponent, {
      workplaceUid: this.workplace.uid,
      currentUserUid: this.user.uid,
    });
    dialog.afterClosed.subscribe(userFullname => {
      if (userFullname) {
        const { role } = this.form.value;
        this.save(role, false, userFullname);
      }
    });
  }

  public onSubmit(payload: { action: string; save: boolean } = { action: 'continue', save: true }) {
    if (!payload.save) {
      return this.router.navigate(this.return.url, { fragment: this.return.fragment });
    }

    this.submitted = true;

    const { role, primary } = this.form.value;
    const updatedPrimary = role === Roles.Read ? false : primary;

    if (this.user.isPrimary && !updatedPrimary) {
      this.changePrimary();
      return;
    }

    this.save(role, updatedPrimary);
  }

  private save(role: Roles, primary: boolean, name: string = null) {
    const props = {
      role,
      isPrimary: primary,
    };

    this.subscriptions.add(
      this.userService.updateUserDetails(this.workplace.uid, this.user.uid, { ...this.user, ...props }).subscribe(
        data => {
          this.router.navigate(['/workplace', this.workplace.uid, 'user', this.user.uid], {
            fragment: 'user-accounts',
          });
          if (data.isPrimary) {
            name = this.user.fullname;
          }
          if (name) {
            this.alertService.addAlert({ type: 'success', message: `${name} is the new primary user` });
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
