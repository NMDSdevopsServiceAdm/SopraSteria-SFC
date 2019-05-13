import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import * as moment from 'moment';

import { DATE_PARSE_FORMAT } from '@core/constants/constants';

function isEmptyInputValue(value: any): boolean {
  // we don't check for string here so it also works with arrays
  return value == null || value.length === 0;
}

export abstract class DateValidator {
  static required(): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {
      const { day, month, year } = formGroup.controls;
      return isEmptyInputValue(day.value) || isEmptyInputValue(month.value) || isEmptyInputValue(year.value)
        ? { required: true }
        : null;
    };
  }

  static dateValid(): ValidatorFn {
    return (formGroup: FormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (!day.value && !month.value && !year.value) {
        return null;
      }

      if ([day.value, month.value, year.value].some(v => !v)) {
        return { dateValid: true };
      }

      return moment(`${year.value}-${month.value}-${day.value}`, DATE_PARSE_FORMAT).isValid()
        ? null
        : { dateValid: true };
    };
  }

  static beforeToday(): ValidatorFn {
    return (formGroup: FormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const date = moment(`${year.value}-${month.value}-${day.value}`, DATE_PARSE_FORMAT);

        if (date.isValid()) {
          return date.isBefore(moment(), 'day') ? null : { beforeToday: true };
        }
      }

      return null;
    };
  }

  static todayOrBefore(): ValidatorFn {
    return (formGroup: FormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const date = moment(`${year.value}-${month.value}-${day.value}`, DATE_PARSE_FORMAT);

        if (date.isValid()) {
          return date.isSameOrBefore(moment(), 'day') ? null : { todayOrBefore: true };
        }
      }

      return null;
    };
  }

  static afterToday(): ValidatorFn {
    return (formGroup: FormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const date = moment(`${year.value}-${month.value}-${day.value}`, DATE_PARSE_FORMAT);

        if (date.isValid()) {
          return date.isAfter(moment(), 'day') ? null : { afterToday: true };
        }
      }

      return null;
    };
  }

  static todayOrAfter(): ValidatorFn {
    return (formGroup: FormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const date = moment(`${year.value}-${month.value}-${day.value}`, DATE_PARSE_FORMAT);

        if (date.isValid()) {
          return date.isSameOrAfter(moment(), 'day') ? null : { todayOrAfter: true };
        }
      }

      return null;
    };
  }

  static between(min: moment.Moment, max: moment.Moment): ValidatorFn {
    return (formGroup: FormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const date = moment(`${year.value}-${month.value}-${day.value}`, DATE_PARSE_FORMAT);

        if (date.isValid()) {
          return date.isBetween(min, max) ? null : { dateBetween: { min, max, actual: date } };
        }
      }

      return null;
    };
  }

  static min(min: moment.Moment): ValidatorFn {
    return (formGroup: FormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const date = moment(`${year.value}-${month.value}-${day.value}`, DATE_PARSE_FORMAT);

        if (date.isValid()) {
          return date.isAfter(min) ? null : { dateMin: { min, actual: date } };
        }
      }

      return null;
    };
  }
}
