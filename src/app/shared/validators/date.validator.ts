import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';
import { FormatUtil } from '@core/utils/format-util';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

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

      if ([day.value, month.value, year.value].some((v) => !v)) {
        return { dateValid: true };
      }

      return dayjs(`${year.value}-${month.value}-${day.value}`, DATE_PARSE_FORMAT).isValid()
        ? null
        : { dateValid: true };
    };
  }

  static beforeStartDate(control: string, before = true): ValidatorFn {
    return (formGroup: FormGroup): { [key: string]: any } | null => {
      const formControlValue = formGroup.parent.get(control).value;
      const comparisonDate = FormatUtil.formatDate(formControlValue);

      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const date = dayjs(`${year.value}-${month.value}-${day.value}`, DATE_PARSE_FORMAT);

        if (date.isValid()) {
          if (before) {
            return date.isAfter(comparisonDate) ? null : { beforeStartDate: true };
          }
          return date.isBefore(comparisonDate) ? null : { afterEndDate: true };
        }
      }

      return null;
    };
  }

  static beforeToday(): ValidatorFn {
    return (formGroup: FormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const date = dayjs(`${year.value}-${month.value}-${day.value}`, DATE_PARSE_FORMAT);

        if (date.isValid()) {
          return date.isBefore(dayjs(), 'day') ? null : { beforeToday: true };
        }
      }

      return null;
    };
  }

  static todayOrBefore(): ValidatorFn {
    return (formGroup: FormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const date = dayjs(`${year.value}-${month.value}-${day.value}`, DATE_PARSE_FORMAT);

        if (date.isValid()) {
          return date.isSameOrBefore(dayjs(), 'day') ? null : { todayOrBefore: true };
        }
      }

      return null;
    };
  }

  static afterToday(): ValidatorFn {
    return (formGroup: FormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const date = dayjs(`${year.value}-${month.value}-${day.value}`, DATE_PARSE_FORMAT);

        if (date.isValid()) {
          return date.isAfter(dayjs(), 'day') ? null : { afterToday: true };
        }
      }

      return null;
    };
  }

  static todayOrAfter(): ValidatorFn {
    return (formGroup: FormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const date = dayjs(`${year.value}-${month.value}-${day.value}`, DATE_PARSE_FORMAT);

        if (date.isValid()) {
          return date.isSameOrAfter(dayjs(), 'day') ? null : { todayOrAfter: true };
        }
      }

      return null;
    };
  }

  static between(min: dayjs.Dayjs, max: dayjs.Dayjs): ValidatorFn {
    return (formGroup: FormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const date = dayjs(`${year.value}-${month.value}-${day.value}`, DATE_PARSE_FORMAT);

        if (date.isValid()) {
          return date.isBetween(min, max) ? null : { dateBetween: { min, max, actual: date } };
        }
      }

      return null;
    };
  }

  static min(min: dayjs.Dayjs): ValidatorFn {
    return (formGroup: FormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const date = dayjs(`${year.value}-${month.value}-${day.value}`, DATE_PARSE_FORMAT);

        if (date.isValid()) {
          return date.isAfter(min) ? null : { dateMin: { min, actual: date } };
        }
      }

      return null;
    };
  }
}
