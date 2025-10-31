import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-radio-button-accordion',
    templateUrl: './radio-button-accordion.component.html',
    styleUrls: ['./radio-button-accordion.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RadioButtonAccordionComponent),
            multi: true,
        },
    ],
    standalone: false
})
export class RadioButtonAccordionComponent implements ControlValueAccessor {
  @Input() title: string;
  @Input() description?: string;
  @Input() formControlName?: string;
  @Input() controlName?: string;
  @Input() items: {
    id: number;
    label: string;
  }[];
  @Input() open: boolean;
  @Input() preFilledId: number;

  @Output() toggleEmitter: EventEmitter<Event> = new EventEmitter();
  @Output() selectedValueEmitter: EventEmitter<number> = new EventEmitter();

  @Input('value') _value = null;
  onChange: any = () => {};
  onTouched: any = () => {};

  get value() {
    return this._value;
  }

  public get buttonText() {
    if (this.open) {
      return 'Hide';
    }
    return 'Show';
  }

  set value(val) {
    this._value = val;
    this.onChange(val);
    this.selectedValueEmitter.emit(val);
    this.onTouched();
  }

  writeValue(value): void {
    if (value) {
      this.value = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onClick(val: any) {
    this.value = val;
  }

  public emitToggle(): void {
    const currentStatus = this.open;
    this.toggleEmitter.emit();
    this.open = !currentStatus;
  }
}
