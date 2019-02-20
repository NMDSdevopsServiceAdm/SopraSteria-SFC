import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { DateValidator } from 'src/app/core/validators/date.validator';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
})
export class DatePickerComponent implements OnInit {
  @Input() formControlPrefix = '';
  @Input() formGroup: FormGroup;
  @Input() label = '';

  ngOnInit() {
    this.formGroup.setValidators(Validators.compose([this.formGroup.validator, DateValidator.dateValid()]));

    this.formGroup.controls.day.setValidators(
      Validators.compose([this.formGroup.controls.day.validator, Validators.min(1)])
    );

    this.formGroup.controls.month.setValidators(
      Validators.compose([this.formGroup.controls.month.validator, Validators.min(1)])
    );

    this.formGroup.controls.year.setValidators(
      Validators.compose([this.formGroup.controls.year.validator, Validators.minLength(4), Validators.maxLength(4)])
    );
  }
}
