import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { CreateAccountRequest } from '@core/model/account.model';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { URLStructure } from '@core/model/url.model';
import { UserPermissionsType } from '@core/model/userDetails.model';
import { BackLinkService } from '@core/services/backLink.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { getUserPermissionsTypes } from '@core/utils/users-util';
import { AccountDetailsDirective } from '@shared/directives/user/account-details.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { take } from 'rxjs/internal/operators/take';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-user-account.component.html',
})
export class CreateUserAccountComponent extends AccountDetailsDirective {
  public callToActionLabel = 'Save user';
  public establishmentUid: string;
  public workplace: Establishment;
  public wdfUserFlag: boolean;
  public permissionsTypeRadios: UserPermissionsType[];

  constructor(
    private createAccountService: CreateAccountService,
    protected route: ActivatedRoute,
    private establishmentService: EstablishmentService,
    private featureFlagsService: FeatureFlagsService,

    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: UntypedFormBuilder,
    protected router: Router,
    private userService: UserService,
  ) {
    super(backLinkService, errorSummaryService, fb, router, route);
  }

  protected init(): void {
    this.featureFlagsService.configCatClient.getValueAsync('wdfUser', false).then((value) => {
      this.wdfUserFlag = value;
      this.setPermissionsTypeRadios();
    });
    this.subscriptions.add(
      this.userService.returnUrl.pipe(take(1)).subscribe((returnUrl) => {
        this.return = returnUrl;
      }),
    );

    this.workplace = this.route.parent.snapshot.data.establishment;

    this.backLinkService.showBackLink();

    this.addFormControls();
    this.establishmentUid = this.route.parent.snapshot.params.establishmentuid;
  }

  public setBreadcrumbJourney() {
    if (this.return.fragment == null) {
      return JourneyType.MY_WORKPLACE;
    } else {
      return JourneyType.ALL_WORKPLACES;
    }
  }

  private addFormControls(): void {
    this.form.addControl(
      'permissionsType',
      new UntypedFormControl(null, {
        validators: [Validators.required],
        updateOn: 'submit',
      }),
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
    const convertedFormData = this.convertPermissions(this.form.value);

    this.subscriptions.add(
      this.createAccountService.createAccount(this.establishmentUid, convertedFormData).subscribe(
        (data) => {
          this.updateEstablishmentUsers();
          this.navigateToNextRoute(data);
        },
        (error: HttpErrorResponse) => this.onError(error),
      ),
    );
  }

  private updateEstablishmentUsers(): void {
    this.userService.getAllUsersForEstablishment(this.establishmentUid).subscribe((users) => {
      this.userService.updateUsers(users);
    });
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

  protected navigateToNextRoute(data): void {
    this.router.navigate(['/workplace', this.establishmentUid, 'user', 'saved', data.uid]);
  }

  get returnTo(): URLStructure {
    return this.return;
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
}
