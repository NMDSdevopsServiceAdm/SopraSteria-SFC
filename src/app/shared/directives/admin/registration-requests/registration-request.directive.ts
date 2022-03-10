import { HttpErrorResponse } from '@angular/common/http';
import { Directive, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Note } from '@core/model/registrations.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';

@Directive()
export class RegistrationRequestDirective implements OnInit {
  public registration;
  public notes: Note[];
  public notesForm: FormGroup;
  public notesError: string;
  public loggedInUser;

  constructor(
    public registrationsService: RegistrationsService,
    protected breadcrumbService: BreadcrumbService,
    protected route: ActivatedRoute,
    protected formBuilder: FormBuilder,
    protected switchWorkplaceService: SwitchWorkplaceService,
  ) {}

  ngOnInit(): void {
    this.loggedInUser = this.route.snapshot.data.loggedInUser;
    this.registration = this.route.snapshot.data.registration;
    this.notes = this.route.snapshot.data.notes;
    this.setBreadcrumbs();
    this.setupNotesForm();
    this.init();
  }

  protected init(): void {}

  protected setBreadcrumbs(): void {}

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
        userUid: this.loggedInUser.uid,
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
