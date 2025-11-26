import { Component, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'app-add-a-note-accordion',
  standalone: false,
  templateUrl: './add-a-note-accordion.component.html',
  styleUrl: './add-a-note-accordion.component.scss'
})
export class AddANoteAccordionComponent {
  @Input() errorMessage :string = ''
  @Input() initialNotesValue :string = '';
  @Input() notes: UntypedFormControl;
  @Input() submitted :boolean = false;
  public notesMaxLength = 1000;
  public notesOpen = false;
  public notesValue: string;
  public remainingCharacterCount: number = this.notesMaxLength;

  ngOnInit(): void {
    this.notesValue = this.initialNotesValue;
  }

  public toggleNotesOpen(): void {
    this.notesOpen = !this.notesOpen;
  }

  public handleOnInput(event: Event) {
    this.notesValue = (<HTMLInputElement>event.target).value;
    this.remainingCharacterCount = this.notesMaxLength - this.notesValue.length;
  }
}
