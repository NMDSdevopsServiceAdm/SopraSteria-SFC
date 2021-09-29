import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';

@Component({
  selector: 'app-rejected-registration-request',
  templateUrl: './rejected-registration-request.component.html',
})
export class RejectedRegistrationRequestComponent implements OnInit {
  public registration;
  public notes;
  public notesForm;
  public notesError;

  constructor(
    public registrationsService: RegistrationsService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private switchWorkplaceService: SwitchWorkplaceService,
  ) {}

  ngOnInit(): void {
    this.registration = this.route.snapshot.data.registration;
    this.notes = this.route.snapshot.data.notes;
    this.setBreadcrumbs();
    this.setupNotesForm();
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.show(JourneyType.ADMIN_REJECTED_REGISTRATIONS);
  }

  public navigateToParentAccount(e: Event): void {
    e.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(
      this.registration.establishment.parentUid,
      '',
      this.registration.establishment.parentEstablishmentId,
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
      },
      (error) => {
        this.notesError = 'There was an error retrieving notes for this registration';
      },
    );
  }
}
