import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { RadioFieldData } from '@core/model/form-controls.model';
import { Roles } from '@core/model/roles.enum';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { AccountDetails } from '@features/account/account-details/account-details';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-user-account.component.html',
})
export class CreateUserAccountComponent extends AccountDetails {
  public callToActionLabel = 'Save user account';
  public establishmentUid: string;
  public workplace: Establishment;
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

  constructor(
    private breadcrumbService: BreadcrumbService,
    private createAccountService: CreateAccountService,
    private route: ActivatedRoute,
    private establishmentService: EstablishmentService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, fb, router);
  }

  protected init(): void {
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
          message: 'Please specify permissions for the new account.',
        },
      ],
    });
  }

  protected save() {
    this.subscriptions.add(
      this.createAccountService.createAccount(this.establishmentUid, this.form.value).subscribe(
        () => this.navigateToNextRoute(),
        (error: HttpErrorResponse) => this.onError(error),
      ),
    );
  }

  protected navigateToNextRoute(): void {
    this.router.navigate(['/workplace', this.establishmentUid, 'user', 'saved']);
  }
}
