import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { CreateAccountRequest } from '@core/model/account.model';
import { Establishment } from '@core/model/establishment.model';
import { RadioFieldData } from '@core/model/form-controls.model';
import { Roles } from '@core/model/roles.enum';
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
  public roleRadios: RadioFieldData[];

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
    this.form.addControl('role', new FormControl(null, Validators.required));

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
    const convertedFormData = this.convertRoleWithWdf(this.form.value);

    this.subscriptions.add(
      this.createAccountService.createAccount(this.establishmentUid, convertedFormData).subscribe(
        (data) => this.navigateToNextRoute(data),
        (error: HttpErrorResponse) => this.onError(error),
      ),
    );
  }

  private convertRoleWithWdf(formValue): CreateAccountRequest {
    return {
      ...formValue,
      role: 'Edit',
      canManageWdfClaims: true,
    };
  }

  protected navigateToNextRoute(data): void {
    this.router.navigate(['/workplace', this.establishmentUid, 'user', 'saved', data.uid]);
  }

  get returnTo() {
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
            label: 'ASC-WDS edit with manage WDF claims',
          },
          {
            value: 'ASC-WDF edit',
            label: 'ASC-WDF edit',
          },
          {
            value: 'ASC-WDS read only with manage WDF claims',
            label: 'ASC-WDS read only with manage WDF claims',
          },
          {
            value: 'ASC-WDS read only',
            label: 'ASC-WDS read only',
          },
          {
            value: 'Manage WDF claims only',
            label: 'Manage WDF claims only',
          },
        ]
      : [
          {
            value: Roles.Edit,
            label: 'Edit',
          },
          {
            value: Roles.Read,
            label: 'Read only',
          },
        ];
  }
}
