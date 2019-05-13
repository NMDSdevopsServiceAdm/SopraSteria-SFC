import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
})
export class DatePickerComponent {
  @Input() formGroup: FormGroup;
  @Input() formGroupName: string;
  @Input() autocomplete: string;
  @Input() submitted: boolean;
}
