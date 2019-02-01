import { FormGroup, ValidatorFn } from "@angular/forms"
import * as moment from "moment"

import { DEFAULT_DATE_FORMAT } from "../constants/constants"


export abstract class DateValidator {
  static dateValid(): ValidatorFn {
    return (formGroup: FormGroup): {[key: string]: any} | null => {
      const { day, month, year } = formGroup.value

      if (day === undefined && month === undefined && year === undefined) {
        return null
      }

      return moment(`${year}-${month}-${day}`, DEFAULT_DATE_FORMAT).isValid() ?
        null : { dateValid: true }
    }
  }

  static datePastOrToday(): ValidatorFn {
    return (formGroup: FormGroup): {[key: string]: any} | null => {
      const { day, month, year } = formGroup.value

      if (day === undefined || month === undefined || year === undefined) {
        return null
      }

      const today = moment().startOf('day')
      return moment(`${year}-${month}-${day}`, DEFAULT_DATE_FORMAT).isAfter(today) ?
        { dateInPast: true } : null
    }
  }
}
