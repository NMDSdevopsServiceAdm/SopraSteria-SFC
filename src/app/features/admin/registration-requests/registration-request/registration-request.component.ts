import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Note } from '@core/model/registrations.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';

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
  public registrationNotes: Note[];
  public notesError: string;

  constructor(
    public registrationsService: RegistrationsService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private switchWorkplaceService: SwitchWorkplaceService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.setBreadcrumbs();
    this.getRegistration();
    this.getUserFullName();
    this.getNotes();
    this.setupForm();
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

  private getNotes(): void {
    this.registrationNotes = this.route.snapshot.data.notes;
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
      (error) => {
        if (error instanceof HttpErrorResponse) {
          this.checkBoxError = 'There was a server error';
        } else {
          this.checkBoxError = 'This registration is already in progress';
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

  public addNote(form: FormGroup): void {
    const body = {
      note: form.get('notes').value,
      establishmentId: this.registration.establishment.id,
    };

    console.log('************ add Note **************');
    console.log(body);
    this.registrationsService.addRegistrationNote(body).subscribe(
      (data) => {
        this.getRegistrationNotes();
      },
      (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.notesError = 'There was an error adding note to registration';
        } else {
          this.notesError = 'There was a server error';
        }
      },
    );
  }

  public getRegistrationNotes(): void {
    this.registrationsService.getRegistrationNotes(this.registration.establishment.uid).subscribe(
      (data) => {
        this.registrationNotes = data;
      },
      (error) => {
        this.notesError = 'There was an error retrieving notes for this registration';
      },
    );
  }
}
