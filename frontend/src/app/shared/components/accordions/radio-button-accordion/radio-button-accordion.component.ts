import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { init } from '@sentry/browser';

@Component({
  selector: 'app-radio-button-accordion',
  templateUrl: './radio-button-accordion.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioButtonAccordionComponent),
      multi: true,
    }
  ]
})
export class RadioButtonAccordionComponent implements ControlValueAccessor {

  @Input() title: string;
  @Input() formControlName: string;
  @Input() items: any[];
  // @Input() selectedValue: number;
  // @Input() formControlName: string;
  @Output() selectedValueChange = new EventEmitter<number>();

  @Output() toggleEmitter: EventEmitter<Event> = new EventEmitter();


  @Input('value') _selectedValue = null;
  onChange: any = () => {};
  onTouched: any = () => {};

  get selectedValue() {
    return this._selectedValue;
  }

  set selectedValue(val) {
    this._selectedValue = val;
    this.onChange(val);
    this.onTouched();
  }

  writeValue(value): void {
    if(value) {
      this.selectedValue = value;
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public selectionChanged(): void {

  }

  public emitToggle(): void {
    this.toggleEmitter.emit();
  }
}
