import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { CreateAccountRequest } from '@core/model/account.model';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { URLStructure } from '@core/model/url.model';
import { UserDetails, UserPermissionsType } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { getUserPermissionsTypes } from '@core/utils/users-util';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-account-edit-permissions',
  templateUrl: './user-account-edit-permissions.component.html',
})
export class UserAccountEditPermissionsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public workplace: Establishment;
  public wdfUserFlag: boolean;
  public user: UserDetails;
  public form: FormGroup;
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
  public permissionsTypeRadios: UserPermissionsType[];
  public return: URLStructure;
  public submitted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private errorSummaryService: ErrorSummaryService,
    private userService: UserService,
    private alertService: AlertService,
    private establishmentService: EstablishmentService,
    private featureFlagsService: FeatureFlagsService,
  ) {
    this.user = this.route.snapshot.data.user;
    this.workplace = this.route.parent.snapshot.data.establishment;

    this.return = {
      url:
        this.route.snapshot.data.primaryWorkplace &&
        this.workplace.uid === this.route.snapshot.data.primaryWorkplace.uid
          ? ['/dashboard']
          : ['/workplace', this.workplace.uid],
      fragment: 'users',
    };
  }

  ngOnInit(): void {
    this.setupServerErrorsMap();
    const journey = this.establishmentService.isOwnWorkplace() ? JourneyType.MY_WORKPLACE : JourneyType.ALL_WORKPLACES;
    this.breadcrumbService.show(journey);
    this.featureFlagsService.configCatClient.getValueAsync('wdfUser', false).then((value) => {
      this.wdfUserFlag = value;
      this.setPermissionsTypeRadios();
    });

    this.form = this.formBuilder.group({
      permissionsType: [null, Validators.required],
      isPrimary: this.user.isPrimary,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: `You cannot change this users permissions`,
      },
    ];
  }

  public onSubmit(payload: { action: string; save: boolean } = { action: 'continue', save: true }) {
    if (!payload.save) {
      return this.router.navigate(this.return.url, { fragment: this.return.fragment });
    }

    this.submitted = true;

    // const { role, primary } = this.form.value;
    // const updatedPrimary = role === Roles.Read ? false : primary;

    // if (this.user.isPrimary && !updatedPrimary) {
    //   this.navigateToSelectPrimaryUserPage();
    //   return;
    // }

    this.save();
  }

  private save(name: string = null): void {
    const props = this.convertPermissions(this.form.value);

    this.subscriptions.add(
      this.userService.updateUserDetails(this.workplace.uid, this.user.uid, { ...this.user, ...props }).subscribe(
        (data) => {
          this.router.navigate(['/workplace', this.workplace.uid, 'user', this.user.uid], {
            fragment: 'users',
          });
          if (data.isPrimary) {
            name = this.user.fullname;
          }
          if (name) {
            this.alertService.addAlert({ type: 'success', message: `${name} is the new primary user` });
          }
        },

        (error) => this.onError(error),
      ),
    );
  }

  private setPermissionsTypeRadios(): void {
    this.permissionsTypeRadios = this.wdfUserFlag
      ? getUserPermissionsTypes(false)
      : [
          {
            permissionsQuestionValue: Roles.Edit,
          },
          {
            permissionsQuestionValue: Roles.Read,
          },
        ];
  }

  private convertPermissions(formValue): CreateAccountRequest {
    if (!this.wdfUserFlag) {
      formValue.role = formValue.permissionsType;
      delete formValue.permissionsType;

      return formValue;
    }

    const radio = this.permissionsTypeRadios.find(
      (radio) => radio.permissionsQuestionValue === formValue.permissionsType,
    );

    delete formValue.permissionsType;

    return {
      ...formValue,
      role: radio.role,
      canManageWdfClaims: radio.canManageWdfClaims,
    };
  }

  private navigateToSelectPrimaryUserPage(): void {
    const selectPrimaryUserLink = this.router.url.replace('permissions', 'select-primary-user');
    this.router.navigate([selectPrimaryUserLink]);
  }

  private onError(error): void {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }
}
