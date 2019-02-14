import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor } from "@angular/forms"
import { FormGroup, NG_VALUE_ACCESSOR } from "@angular/forms"


@Component({
  selector: 'app-auto-suggest',
  templateUrl: './auto-suggest.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutoSuggestComponent),
      multi: true
    }
  ]
})
export class AutoSuggestComponent implements ControlValueAccessor {

  @Input() formControlName: string
  @Input() formGroup: FormGroup
  @Input() placeholder: string = ""
  @Input() dataProvider: Function

  constructor() {}

  suggestClickHandler(event) {
    const { target } = event

    let newValue = null

    if (target.nodeName === "SPAN") {
      newValue = target.innerText

    } else if (target.nodeName === "LI") {
      newValue = target.children[0].innerText
    }

    if (newValue) {
      this.formGroup.patchValue({
        [this.formControlName]: newValue
      })
    }
  }

  // do nothing with these so far
  onChange: Function
  onTouched: Function

  writeValue(value: any): void {
    // let's do nothing here and delegate model binding in input field
  }

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
}
