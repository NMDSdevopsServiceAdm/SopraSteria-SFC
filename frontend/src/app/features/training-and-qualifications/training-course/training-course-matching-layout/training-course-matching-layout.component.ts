import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-training-course-matching-layout',
  templateUrl: './training-course-matching-layout.component.html',
})
export class TrainingCourseMatchingLayoutComponent {
  public form: UntypedFormGroup;
  public submitted = false;
  public submitButtonDisabled: boolean = false;
  public buttonText: string;
  public notesOpen = false;
  public notesMaxLength = 1000;
  public remainingCharacterCount: number = this.notesMaxLength;
  public notesValue = '';
  public multipleTrainingDetails: boolean;

  public onCancel(event: Event): void {
    event.preventDefault();
  }
  public handleOnInput(event: Event) {
    this.notesValue = (<HTMLInputElement>event.target).value;
    this.remainingCharacterCount = this.notesMaxLength - this.notesValue.length;
  }
  public toggleNotesOpen(): void {
    this.notesOpen = !this.notesOpen;
  }
}
