import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Roles } from '@core/model/roles.enum';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { filter, find } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-primary-user',
  templateUrl: './change-primary-user.component.html',
})
export class ChangePrimaryUserComponent implements OnInit, OnDestroy {
  @ViewChild('formEl') formEl: ElementRef;
  private subscriptions: Subscription = new Subscription();
  public users: UserDetails[];
  public form: FormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
  public currentUserUid: string;
  public workplaceUid: string;
  public return: URLStructure;

  constructor(
    private formBuilder: FormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private userService: UserService,
    private route: ActivatedRoute,
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    public alertService: AlertService,
  ) {
    this.currentUserUid = this.route.snapshot.data.user.uid;
    this.workplaceUid = this.route.parent.snapshot.data.establishment.uid;

    this.return = { url: ['../permissions'] };
  }

  ngOnInit(): void {
    this.setBreadcrumbs();

    this.subscriptions.add(
      this.userService.getAllUsersForEstablishment(this.workplaceUid).subscribe((allUsers) => {
        this.users = this.filterActiveNonPrimaryEditUsers(allUsers);
      }),
    );

    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const { user } = this.form.value;
    const selectedUser = find(this.users, ['uid', user]);

    const props = {
      role: selectedUser.role,
      isPrimary: true,
    };

    this.subscriptions.add(
      this.userService.updateUserDetails(this.workplaceUid, selectedUser.uid, { ...selectedUser, ...props }).subscribe(
        (data) => {
          this.router.navigate(['/workplace', this.workplaceUid, 'user', this.currentUserUid]);
          this.alertService.addAlert({ type: 'success', message: `${selectedUser.fullname} is the new primary user.` });
        },
        (error) => this.onError(error),
      ),
    );
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private onError(error): void {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      user: [
        '',
        {
          validators: Validators.required,
          updateOn: 'submit',
        },
      ],
    });
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'user',
        type: [
          {
            name: 'required',
            message: 'Select the new primary user',
          },
        ],
      },
    ];
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 406,
        message: `You cannot make this user the primary user.`,
      },
    ];
  }

  private setBreadcrumbs(): void {
    const journey = this.establishmentService.isOwnWorkplace() ? JourneyType.MY_WORKPLACE : JourneyType.ALL_WORKPLACES;
    this.breadcrumbService.show(journey);
  }

  public filterActiveNonPrimaryEditUsers(allUsers: UserDetails[]): UserDetails[] {
    return filter(
      allUsers,
      (user) => user.status === 'Active' && user.role === Roles.Edit && user.uid !== this.currentUserUid,
    );
  }
}
