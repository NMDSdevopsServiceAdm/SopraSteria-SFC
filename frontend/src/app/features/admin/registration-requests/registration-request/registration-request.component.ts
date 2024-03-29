import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { RegistrationApprovalOrRejectionRequestBody } from '@core/model/registrations.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { Dialog, DialogService } from '@core/services/dialog.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { RegistrationRequestDirective } from '@shared/directives/admin/registration-requests/registration-request.directive';

import { ApprovalOrRejectionDialogComponent } from '../../components/approval-or-rejection-dialog/approval-or-rejection-dialog.component';

@Component({
  selector: 'app-registration-request',
  templateUrl: './registration-request.component.html',
})
export class RegistrationRequestComponent extends RegistrationRequestDirective {
  public workplaceIdForm: UntypedFormGroup;
  public postcodeForm: UntypedFormGroup;
  public invalidWorkplaceIdEntered: boolean;
  public invalidPostcodeEntered: boolean;
  public submitted: boolean;
  public userFullName: string;
  public checkBoxError: string;
  public approvalOrRejectionServerError: string;

  constructor(
    public registrationsService: RegistrationsService,
    protected breadcrumbService: BreadcrumbService,
    protected route: ActivatedRoute,
    protected switchWorkplaceService: SwitchWorkplaceService,
    protected formBuilder: UntypedFormBuilder,
    private alertService: AlertService,
    private dialogService: DialogService,
    private router: Router,
  ) {
    super(registrationsService, breadcrumbService, route, formBuilder, switchWorkplaceService);
  }

  protected init(): void {
    this.userFullName = this.route.snapshot.data.loggedInUser.fullname;
    this.setupForm();
  }

  get nmdsId(): AbstractControl {
    return this.workplaceIdForm.get('nmdsId');
  }

  get postcode(): AbstractControl {
    return this.postcodeForm.get('postcode');
  }

  private setupForm(): void {
    this.workplaceIdForm = new UntypedFormGroup({
      nmdsId: new UntypedFormControl(this.registration.establishment.nmdsId, [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8),
      ]),
    });

    this.postcodeForm = new UntypedFormGroup({
      postcode: new UntypedFormControl(this.registration.establishment.postcode , [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(8),
        Validators.pattern(/^([A-Za-z][A-Ha-hJ-Yj-y]?[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}|[Gg][Ii][Rr] ?0[Aa]{2})$/)
      ]),
    });
  }

  public updateWorkplaceId(): void {
    if (this.nmdsId.invalid) {
      this.invalidWorkplaceIdEntered = true;
      return;
    }

    const body = {
      uid: this.registration.establishment.uid,
      nmdsId: this.nmdsId.value,
    };

    this.registrationsService.updateWorkplaceId(body).subscribe(
      () => {
        this.getUpdatedRegistration();
        this.showWorkplaceIdUpdatedAlert();
      },
      (err) => {
        this.invalidWorkplaceIdEntered = true;
        if (err instanceof HttpErrorResponse) {
          this.populateErrorFromServer(err);
        }
      },
    );
  }

  public updatePostcode(): void {


    if (this.postcode.invalid) {

      this.invalidPostcodeEntered = true;
      return;
    }
    const body = {
      uid: this.registration.establishment.uid,
      postcode: this.postcode.value,
    };
    this.registrationsService.updatePostcode(body).subscribe(
      () => {
        this.getUpdatedRegistration();
        this.showPostcodeUpdatedAlert();
      },
      (err) => {
        this.invalidPostcodeEntered = true;
        if (err instanceof HttpErrorResponse) {
          this.populateErrorPostcode(err);
        }
      },
    );
  }

  private populateErrorFromServer(err) {
    const validationErrors = err.error;

    Object.keys(validationErrors).forEach((prop) => {
      const formControl = this.workplaceIdForm.get(prop);
      if (formControl) {
        formControl.setErrors({
          serverError: validationErrors[prop],
        });
      }
    });
  }

  private populateErrorPostcode(err) {

    const validationErrors = err.error;

    Object.keys(validationErrors).forEach((prop) => {
      const formControl = this.postcodeForm.get(prop);
      if (formControl) {
        formControl.setErrors({
          serverError: validationErrors[prop],
        });
      }
    });
  }

  protected setBreadcrumbs(): void {
    this.breadcrumbService.show(JourneyType.ADMIN_PENDING_REGISTRATIONS);
  }

  public setStatusClass(status: string): string {
    return status === 'PENDING' ? 'govuk-tag--grey' : 'govuk-tag--blue';
  }

  public toggleCheckbox(target: HTMLInputElement): void {
    const { checked } = target;

    const body = {
      uid: this.registration.establishment.uid,
      status: checked ? 'IN PROGRESS' : 'PENDING',
      reviewer: checked ? this.userFullName : null,
      inReview: checked,
    };

    this.registrationsService.updateRegistrationStatus(body).subscribe(
      () => {
        this.getUpdatedRegistration();
      },
      (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.checkBoxError = 'This registration is already in progress';
        } else {
          this.checkBoxError = 'There was a server error';
        }
      },
    );
  }

  public getUpdatedRegistration(): void {
    this.registrationsService.getSingleRegistration(this.registration.establishment.uid).subscribe(
      (data) => {
        this.registration = data;
      },
      (error) => {
        this.checkBoxError = 'There was an error retrieving the registration';
      },
    );
  }

  public approveOrRejectRegistration(isApproval: boolean): void {
    const dialog = this.openApprovalOrRejectionDialog(isApproval);

    dialog.afterClosed.subscribe((confirmed) => {
      if (confirmed) {
        const body = this.getApprovalOrRejectionRequestBody(isApproval);

        this.registrationsService.registrationApproval(body).subscribe(
          () => {
            this.router.navigate(['/sfcadmin', 'registrations']);
            this.showApprovalOrRejectionConfirmationAlert(isApproval);
          },
          (err) => {
            this.approvalOrRejectionServerError = `There was an error completing the ${
              isApproval ? 'approval' : 'rejection'
            }`;
          },
        );
      }
    });
  }

  private getApprovalOrRejectionRequestBody(isApproval: boolean): RegistrationApprovalOrRejectionRequestBody {
    const body: RegistrationApprovalOrRejectionRequestBody = {
      nmdsId: this.registration.establishment.nmdsId,
      approve: isApproval,
    };

    if (this.registration.email) {
      body.username = this.registration.username;
    } else {
      body.establishmentId = this.registration.establishment.id;
    }

    return body;
  }

  private openApprovalOrRejectionDialog(isApproval: boolean): Dialog<ApprovalOrRejectionDialogComponent> {
    return this.dialogService.open(ApprovalOrRejectionDialogComponent, {
      workplaceName: this.registration.establishment.name,
      approvalName: 'registration request',
      approvalType: 'request',
      isApproval,
    });
  }

  private showWorkplaceIdUpdatedAlert(): void {
    this.alertService.addAlert({
      type: 'success',
      message: `The workplace ID has been successfully updated to ${this.nmdsId.value}`,
    });
  }

  private showPostcodeUpdatedAlert(): void {
    this.alertService.addAlert({
      type: 'success',
      message: `The Postcode has been successfully updated to ${this.postcode.value}`,
    });
  }
  private showApprovalOrRejectionConfirmationAlert(isApproval: boolean): void {
    this.alertService.addAlert({
      type: 'success',
      message: `The workplace '${this.registration.establishment.name}' has been ${
        isApproval ? 'approved' : 'rejected'
      }`,
    });
  }
}
