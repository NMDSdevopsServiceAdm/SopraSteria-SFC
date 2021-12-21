import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Note } from '@core/model/registrations.model';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';

@Component({
  selector: 'app-parent-request-individual',
  templateUrl: './parent-request-individual.component.html',
})
export class ParentRequestIndividualComponent implements OnInit {
  public registration: any;
  public loggedInUser;
  public userFullName: string;
  public notes: Note[];
  public notesForm: FormGroup;
  public notesError: string;
  public checkBoxError: string;

  constructor(
    public registrationsService: RegistrationsService,
    private route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public switchWorkplaceService: SwitchWorkplaceService,
    public parentRequestsService: ParentRequestsService,
  ) {}

  ngOnInit(): void {
    this.loggedInUser = this.route.snapshot.data.loggedInUser;
    this.registration = this.route.snapshot.data.parentRequestsIndividual;
    this.userFullName = this.loggedInUser.fullname;
    this.notes = this.route.snapshot.data.notes;
    this.setupNotesForm();
  }

  public navigateToWorkplace = (id: string, username: string, nmdsId: string, event: Event): void => {
    event.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(id, username, nmdsId);
  };

  public toggleCheckbox(target: HTMLInputElement): void {
    const { checked } = target;

    const body = {
      uid: this.registration.establishment.establishmentUid,
      status: checked ? 'In progress' : 'Pending',
      reviewer: checked ? this.userFullName : null,
      inReview: checked,
    };
    this.parentRequestsService.updateApprovalStatus(body).subscribe(
      () => {
        this.getUpdatedRegistration();
      },
      (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.checkBoxError = 'This approval is already in progress';
        } else {
          this.checkBoxError = 'There was a server error';
        }
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
        establishmentId: this.registration.establishment.establishmentId,
        noteType: 'Main Service',
        userUid: this.loggedInUser.uid,
      };

      this.registrationsService.addRegistrationNote(body).subscribe(
        () => {
          this.getNotes();
          this.notesForm.reset();
        },
        (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.notesError = 'There was an error adding the note';
          } else {
            this.notesError = 'There was a server error';
          }
        },
      );
    }
  }

  public getNotes(): void {
    this.registrationsService.getRegistrationNotes(this.registration.establishment.establishmentUid).subscribe(
      (data) => {
        this.notes = data;
      },
      () => {
        this.notesError = 'There was an error retrieving the notes';
      },
    );
  }

  public getUpdatedRegistration(): void {
    this.parentRequestsService.getIndividualParentRequest(this.registration.establishment.establishmentUid).subscribe(
      (data) => {
        this.registration = data;
      },
      () => {
        this.checkBoxError = 'There was an error retrieving the approval';
      },
    );
  }
}
