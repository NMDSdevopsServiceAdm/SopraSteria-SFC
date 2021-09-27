import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Note, RegistrationApprovalOrRejectionRequestBody } from '@core/model/registrations.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { Dialog, DialogService } from '@core/services/dialog.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';

import {
  RegistrationApprovalOrRejectionDialogComponent,
} from '../registration-approval-or-rejection-dialog/registration-approval-or-rejection-dialog.component';

@Component({
  selector: 'app-registration-request',
  templateUrl: './registration-request.component.html',
})
export class RegistrationRequestComponent implements OnInit {
  public registration;
  public workplaceIdForm: FormGroup;
  public invalidWorkplaceIdEntered: boolean;
  public submitted: boolean;
  public userFullName: string;
  public checkBoxError: string;
  public notes: Note[];
  public notesForm: FormGroup;
  public notesError: string;
  public approvalOrRejectionServerError: string;

  constructor(
    public registrationsService: RegistrationsService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private switchWorkplaceService: SwitchWorkplaceService,
    private alertService: AlertService,
    private dialogService: DialogService,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.setBreadcrumbs();
    this.getRegistration();
    this.getUserFullName();
    this.getRegistrationNotes();
    this.setupForm();
    this.setupNotesForm();
  }

  get nmdsId(): AbstractControl {
    return this.workplaceIdForm.get('nmdsId');
  }

  private getRegistration(): void {
    this.registration = this.route.snapshot.data.registration;
  }

  private getUserFullName(): void {
    this.userFullName = this.route.snapshot.data.loggedInUser.fullname;
  }

  private getRegistrationNotes(): void {
    this.notes = this.route.snapshot.data.notes;
    console.log(this.notes);
  }

  private setupForm(): void {
    this.workplaceIdForm = new FormGroup({
      nmdsId: new FormControl(this.registration.establishment.nmdsId, [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8),
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

  private setBreadcrumbs(): void {
    this.breadcrumbService.show(JourneyType.ADMIN_REGISTRATIONS);
  }

  public navigateToParentAccount(e: Event): void {
    e.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(
      this.registration.establishment.parentUid,
      '',
      this.registration.establishment.parentEstablishmentId,
    );
  }

  private showWorkplaceIdUpdatedAlert(): void {
    this.alertService.addAlert({
      type: 'success',
      message: `The workplace ID has been successfully updated to ${this.nmdsId.value}`,
    });
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

  private setupNotesForm(): void {
    this.notesForm = this.formBuilder.group({
      notes: ['', { validators: [Validators.required], updateOn: 'submit' }],
    });
  }

  public addNote(): void {
    if (this.notesForm.valid) {
      const body = {
        note: this.notesForm.get('notes').value,
        establishmentId: this.registration.establishment.id,
        noteType: 'Registration',
      };

      this.registrationsService.addRegistrationNote(body).subscribe(
        () => {
          this.getNotes();
          this.notesForm.reset();
        },
        (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.notesError = 'There was an error adding the note to the registration';
          } else {
            this.notesError = 'There was a server error';
          }
        },
      );
    }
  }

  public getNotes(): void {
    this.registrationsService.getRegistrationNotes(this.registration.establishment.uid).subscribe(
      (data) => {
        this.notes = data;
        console.log(this.notes);
      },
      (error) => {
        this.notesError = 'There was an error retrieving notes for this registration';
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

  private openApprovalOrRejectionDialog(isApproval: boolean): Dialog<RegistrationApprovalOrRejectionDialogComponent> {
    return this.dialogService.open(RegistrationApprovalOrRejectionDialogComponent, {
      workplaceName: this.registration.establishment.name,
      isApproval,
    });
  }
}
