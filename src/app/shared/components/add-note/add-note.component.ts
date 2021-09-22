import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Note } from '@core/model/registrations.model';
import { RegistrationsService } from '@core/services/registrations.service';

@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
})
export class AddNoteComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  @Input() public addNote: (form: FormGroup) => void;
  @Input() public getRegistrationNotes: () => void;
  @Input() public registration;
  @Input() public registrationNotes: Note[];
  public notesForm: FormGroup;

  constructor(private formBuilder: FormBuilder, public registrationsService: RegistrationsService) {}

  ngOnInit(): void {
    this.setupForm();
  }

  private setupForm(): void {
    this.notesForm = this.formBuilder.group({
      notes: ['', { validators: [Validators.required], updateOn: 'submit' }],
    });
  }

  public onSubmit(): void {
    // console.log('*********** onSubmit ***********');
    // console.log(this.notesForm.valid);
    // console.log(this.notesForm.get('notes').value);
    if (this.notesForm.valid) {
      this.addNote(this.notesForm);
      this.notesForm.reset();
    }
  }
}
