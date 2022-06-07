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
import { take } from 'rxjs/internal/operators/take';

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
    private establishmentService: EstablishmentService,
  ) {
    this.user = this.route.snapshot.data.user;
    this.workplace = this.route.parent.snapshot.data.establishment;
  }

  ngOnInit(): void {
    this.setupServerErrorsMap();

    this.subscriptions.add(
      this.userService.returnUrl$.pipe(take(1)).subscribe((returnUrl) => {
        this.return = returnUrl;
      }),
    );

    const journey = this.setBreadcrumbJourney();
    this.breadcrumbService.show(journey);

    this.form = this.formBuilder.group({
      role: [this.user.role, Validators.required],
      primary: this.user.isPrimary,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public setBreadcrumbJourney() {
    if (this.return.fragment == null) {
      return JourneyType.MY_WORKPLACE;
    } else {
      return JourneyType.ALL_WORKPLACES;
    }
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

    const { role, primary } = this.form.value;
    const updatedPrimary = role === Roles.Read ? false : primary;

    if (this.user.isPrimary && !updatedPrimary) {
      this.navigateToSelectPrimaryUserPage();
      return;
    }

    this.save(role, updatedPrimary);
  }

  private save(role: Roles, primary: boolean, name: string = null): void {
    const props = {
      role,
      isPrimary: primary,
    };

    this.subscriptions.add(
      this.userService.updateUserDetails(this.workplace.uid, this.user.uid, { ...this.user, ...props }).subscribe(
        (data) => {
          this.router.navigate(['/workplace', this.workplace.uid, 'user', this.user.uid]);
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

  private navigateToSelectPrimaryUserPage(): void {
    const selectPrimaryUserLink = this.router.url.replace('permissions', 'select-primary-user');
    this.router.navigate([selectPrimaryUserLink]);
  }

  private onError(error): void {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }
}
