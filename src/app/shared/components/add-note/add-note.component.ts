import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
})
export class AddNoteComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  @Input() public addNote: (form: FormGroup) => void;
  public notesForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.setupForm();
  }

  private setupForm(): void {
    this.notesForm = this.formBuilder.group({
      notes: ['', { validators: [Validators.required], updateOn: 'submit' }],
    });
  }

  public onSubmit(): void {
    if (this.notesForm.valid) {
      this.addNote(this.notesForm);
    }
  }
}
