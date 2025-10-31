import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { UserDetails } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { isAdminRole } from '@core/utils/check-role-util';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-delete-workplace',
    templateUrl: './delete-workplace.component.html',
    standalone: false
})
export class DeleteWorkplaceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('formEl') formEl: ElementRef;

  private subscriptions: Subscription = new Subscription();
  public workplace: Establishment;
  public canDeleteEstablishment: boolean;
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public serverErrorsMap: Array<ErrorDefinition>;
  public submitted = false;
  public serverError: string;
  public isParentSubsidiaryView: boolean;
  public user: UserDetails;

  constructor(
    private router: Router,
    public parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private breadcrumbService: BreadcrumbService,
    private errorSummaryService: ErrorSummaryService,
    private formBuilder: UntypedFormBuilder,
    private alertService: AlertService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private userService: UserService,
  ) {}

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  ngOnInit(): void {
    this.isParentSubsidiaryView = this.parentSubsidiaryViewService.getViewingSubAsParent();

    this.workplace = this.establishmentService.establishment;

    this.breadcrumbService.show(JourneyType.DELETE_WORKPLACE);
    this.setupForm();
    this.setupFormErrorsMap();
    this.getPermissions();
  }

  private getPermissions(): void {
    this.user = this.userService.loggedInUser;
    if (isAdminRole(this.user?.role)) {
      this.canDeleteEstablishment = this.permissionsService.can(this.workplace?.uid, 'canDeleteAllEstablishments');
    } else {
      this.canDeleteEstablishment = this.permissionsService.can(this.workplace?.uid, 'canDeleteEstablishment');
    }
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      deleteWorkplace: ['', { validators: [Validators.required], updateOn: 'submit' }],
    });
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'deleteWorkplace',
        type: [
          {
            name: 'required',
            message: 'Select yes if you want to delete this workplace',
          },
        ],
      },
    ];
  }

  public onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted = true;
    this.errorSummaryService.syncErrorsEvent.next(true);

    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    } else {
      const formValue = this.form.controls.deleteWorkplace.value;
      if (formValue === 'no') {
        this.router.navigate(['/dashboard']);
      } else if (formValue === 'yes') {
        this.deleteWorkplace();
      }
    }
  }

  public async deleteWorkplace(): Promise<void> {
    if (!this.canDeleteEstablishment) {
      return;
    }

    this.subscriptions.add(
      this.establishmentService.deleteWorkplace(this.workplace.uid).subscribe(
        () => {
          if (this.isParentSubsidiaryView) {
            this.parentSubsidiaryViewService.clearViewingSubAsParent();
            this.establishmentService.setCheckForChildWorkplaceChanges(true);

            this.router.navigate(['/workplace', 'view-all-workplaces']);
            this.displaySuccessfullyDeletedAlert();
          } else {
            this.router.navigate(['sfcadmin', 'search', 'workplace']);
            this.displaySuccessfullyDeletedAlert();
          }
        },
        () => {
          this.alertService.addAlert({
            type: 'warning',
            message: `There was an error deleting ${this.workplace.name}`,
          });
        },
      ),
    );
  }

  private displaySuccessfullyDeletedAlert(): void {
    this.alertService.addAlert({
      type: 'success',
      message: `Workplace deleted: ${this.workplace.name}`,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
