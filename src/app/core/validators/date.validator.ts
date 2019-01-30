import { AbstractControl, FormGroup, ValidatorFn } from "@angular/forms"
import * as moment from "moment"

import { DEFAULT_DATE_FORMAT } from "../constants/constants"


export abstract class DateValidator {
  static dateValid(form: FormGroup): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const { day, month, year } = form.value

      if (day && month && year) {
        return moment(`${year}-${month}-${day}`, DEFAULT_DATE_FORMAT).isValid() ?
          null : { dateValid: true }
      }

      return null
    }
  }

  static datePastOrToday(form: FormGroup): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const { day, month, year } = form.value

      if (day && month && year) {
        const today = moment().startOf('day')
        return moment(`${year}-${month}-${day}`, DEFAULT_DATE_FORMAT).isAfter(today) ?
          { datePast: true } : null
      }

      return null
    }
  }
}
