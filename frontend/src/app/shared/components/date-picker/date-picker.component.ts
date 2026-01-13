import { Component, ElementRef, EventEmitter, Input, Output, viewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FormGroupDateValues } from '@core/utils/date-util';

const parseStringAsNumber = (inputValue: string) => {
  return inputValue === '' ? null : parseInt(inputValue);
};

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  standalone: false,
})
export class DatePickerComponent {
  @Input() formGroup: UntypedFormGroup;
  @Input() formGroupName: string;
  @Input() autocomplete: string;
  @Input() submitted: boolean;
  @Output() onChange: EventEmitter<FormGroupDateValues> = new EventEmitter();

  public dayEl = viewChild.required<ElementRef<HTMLInputElement>>('dayEl');
  public monthEl = viewChild.required<ElementRef<HTMLInputElement>>('monthEl');
  public yearEl = viewChild.required<ElementRef<HTMLInputElement>>('yearEl');

  handleChange(): void {
    this.onChange.emit(this.internalState);
  }

  get internalState(): FormGroupDateValues {
    return {
      day: parseStringAsNumber(this.dayEl().nativeElement.value),
      month: parseStringAsNumber(this.monthEl().nativeElement.value),
      year: parseStringAsNumber(this.yearEl().nativeElement.value),
    };
  }
}
