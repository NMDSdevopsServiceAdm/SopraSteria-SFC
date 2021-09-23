import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Note } from '@core/model/registrations.model';
import { RegistrationsService } from '@core/services/registrations.service';

@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
})
export class AddNoteComponent {
  @ViewChild('formEl') formEl: ElementRef;
  @Input() public addNote: () => void;
  @Input() public getNotes: () => void;
  @Input() public registration;
  @Input() public notes: Note[];
  @Input() public notesError: string;
  @Input() public notesForm: FormGroup;

  constructor(public registrationsService: RegistrationsService) {}
}
