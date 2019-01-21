import { Component, Input } from '@angular/core';
import { FormGroup } from "@angular/forms"


@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html'
})
export class DatePickerComponent {

  @Input() formControlPrefix: string = ""
  @Input() formGroup: FormGroup
  @Input() label: string = ""

  constructor() {}
}
