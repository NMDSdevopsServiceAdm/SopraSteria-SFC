import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { CreateAccountRequest } from '@core/model/account.model';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { AccountDetailsDirective } from '@shared/directives/user/account-details.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-user-account.component.html',
})
export class CreateUserAccountComponent extends AccountDetailsDirective {
  public callToActionLabel = 'Save user';
  public establishmentUid: string;
  public workplace: Establishment;
  public wdfUserFlag: boolean;
  public roleRadios: {
    value: string;
    role?: string;
    canManageWdfClaims?: boolean;
  }[];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private createAccountService: CreateAccountService,
    private route: ActivatedRoute,
    private establishmentService: EstablishmentService,
    private featureFlagsService: FeatureFlagsService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, fb, router);
  }

  protected init(): void {
    this.featureFlagsService.configCatClient.getValueAsync('wdfUser', false).then((value) => {
      this.wdfUserFlag = value;
      this.setRoleRadios();
    });
    this.workplace = this.route.parent.snapshot.data.establishment;
    const journey = this.establishmentService.isOwnWorkplace() ? JourneyType.MY_WORKPLACE : JourneyType.ALL_WORKPLACES;
    this.breadcrumbService.show(journey);
    this.addFormControls();
    this.establishmentUid = this.route.parent.snapshot.params.establishmentuid;
  }

  private addFormControls(): void {
    this.form.addControl(
      'role',
      new FormControl(null, {
        validators: [Validators.required],
        updateOn: 'submit',
      }),
    );

    this.formErrorsMap.push({
      item: 'role',
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
        (data) => this.navigateToNextRoute(data),
        (error: HttpErrorResponse) => this.onError(error),
      ),
    );
  }

  private convertPermissions(formValue): CreateAccountRequest {
    if (!this.wdfUserFlag) return formValue;

    const radio = this.roleRadios.find((radio) => radio.value === formValue.role);
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
    return {
      url: ['/dashboard'],
      fragment: 'users',
    };
  }

  private setRoleRadios(): void {
    this.roleRadios = this.wdfUserFlag
      ? [
          {
            value: 'ASC-WDS edit with manage WDF claims',
            role: 'Edit',
            canManageWdfClaims: true,
          },
          {
            value: 'ASC-WDS edit',
            role: 'Edit',
            canManageWdfClaims: false,
          },
          {
            value: 'ASC-WDS read only with manage WDF claims',
            role: 'Read',
            canManageWdfClaims: true,
          },
          {
            value: 'ASC-WDS read only',
            role: 'Read',
            canManageWdfClaims: false,
          },
          {
            value: 'Manage WDF claims only',
            role: 'None',
            canManageWdfClaims: true,
          },
        ]
      : [
          {
            value: Roles.Edit,
          },
          {
            value: Roles.Read,
          },
        ];
  }
}
