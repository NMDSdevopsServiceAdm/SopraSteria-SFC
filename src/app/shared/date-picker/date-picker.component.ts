import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from "@angular/forms"
import * as moment from "moment"

import { DEFAULT_DATE_FORMAT } from "../../core/constants/constants"


@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html'
})
export class DatePickerComponent implements OnInit {

  @Input() formControlPrefix: string = ""
  @Input() formGroup: FormGroup
  @Input() label: string = ""

  constructor() {
    this.validateGroup = this.validateGroup.bind(this)
  }

  private validateGroup(control: AbstractControl) {
    const { day, month, year } = this.formGroup.value

    if (day && month && year) {
      return moment(`${year}-${month}-${day}`, DEFAULT_DATE_FORMAT).isValid() ?
        null : { validateGroup: true }
    }

    return null
  }

  ngOnInit() {
    this.formGroup.setValidators(this.validateGroup)
  }
}
