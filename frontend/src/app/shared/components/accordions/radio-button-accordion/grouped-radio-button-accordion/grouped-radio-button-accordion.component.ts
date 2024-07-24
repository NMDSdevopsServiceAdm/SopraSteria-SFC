import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { init } from '@sentry/browser';

@Component({
  selector: 'app-grouped-radio-button-accordion',
  templateUrl: './grouped-radio-button-accordion.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GroupedRadioButtonAccordionComponent),
      multi: true,
    }
  ]
})
export class GroupedRadioButtonAccordionComponent implements ControlValueAccessor {
  @Input() formControlName: string;
  @Input() set accordions(value:
        {
            title: string;
            descriptionText: string;
            open: boolean;
            index: number;
            items: [{
                id: number;
                label: string;
            }];
        }[]
    ) {
      this._accordions = value.map(x => {
        return {
          ...x,
          open: false,
          index: value.indexOf(x)
        }
      });
    }

  get accordions() {
    return this._accordions;
  }

  private _accordions: {
    open: boolean; title: string; descriptionText: string; index: number, items: [{
      id: number;
      label: string;
    }];
  }[];

  public openAll(): void {
    this.accordions.forEach((x) =>x.open = true);
  }

  public closeAll() {
    this.accordions.forEach((x) => x.open = false);
  }

  public toggleAll(): void {
    if(this.accordions.some(x => x.open !== true)) {
      this.openAll();
    } else {
      this.closeAll();
    }
  }

  public get toggleText() {
    if(this.accordions.some(x => x.open !== true)) {
      return 'Open all';
    }
    return 'Close all';
  }

  public toggleAccordion(index) {
   this.accordions[index].open = !this._accordions[index].open;
  }

  @Input('value') _value = null;
  onChange: any = () => {};
  onTouched: any = () => {};

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  writeValue(value): void {
    if(value) {
      this.value = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onClick(val: number) {
    this.value = val;
  }
}
