import { UntypedFormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DATE_DAY_VALID, DATE_MONTH_VALID, DATE_PARSE_FORMAT } from '@core/constants/constants';
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
  static validate(date: string, format: string): boolean {
    return dayjs(date, format).format(format) === date;
  }

  static required(): ValidatorFn {
    return (formGroup: UntypedFormGroup): ValidationErrors | null => {
      const { day, month, year } = formGroup.controls;
      return isEmptyInputValue(day.value) || isEmptyInputValue(month.value) || isEmptyInputValue(year.value)
        ? { required: true }
        : null;
    };
  }

  static dateValid(): ValidatorFn {
    return (formGroup: UntypedFormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value == !DATE_DAY_VALID || month.value == !DATE_MONTH_VALID) {
        return { dateValid: true };
      }

      if (!day.value && !month.value && !year.value) {
        return null;
      }

      if ([day.value, month.value, year.value].some((v) => !v)) {
        return { dateValid: true };
      }

      const formattedDate =
        FormatUtil.formatSingleDigit(year.value) +
        '-' +
        FormatUtil.formatSingleDigit(month.value) +
        '-' +
        FormatUtil.formatSingleDigit(day.value);

      return this.validate(formattedDate, DATE_PARSE_FORMAT) ? null : { dateValid: true };
    };
  }

  static beforeStartDate(control: string, before = true, ignoreBlankStartDate = false): ValidatorFn {
    return (formGroup: UntypedFormGroup): { [key: string]: any } | null => {
      const formControlValue = formGroup.parent.get(control).value;

      const comparisonDate = FormatUtil.formatDate(formControlValue);

      if (isNaN(comparisonDate.getTime()) && ignoreBlankStartDate) {
        return null;
      }

      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const formattedDate =
          FormatUtil.formatSingleDigit(year.value) +
          '-' +
          FormatUtil.formatSingleDigit(month.value) +
          '-' +
          FormatUtil.formatSingleDigit(day.value);
        const date = dayjs(formattedDate, DATE_PARSE_FORMAT);

        if (this.validate(formattedDate, DATE_PARSE_FORMAT)) {
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
    return (formGroup: UntypedFormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const formattedDate =
          FormatUtil.formatSingleDigit(year.value) +
          '-' +
          FormatUtil.formatSingleDigit(month.value) +
          '-' +
          FormatUtil.formatSingleDigit(day.value);
        const date = dayjs(formattedDate, DATE_PARSE_FORMAT);

        if (this.validate(formattedDate, DATE_PARSE_FORMAT)) {
          return date.isBefore(dayjs(), 'day') ? null : { beforeToday: true };
        }
      }

      return null;
    };
  }

  static todayOrBefore(): ValidatorFn {
    return (formGroup: UntypedFormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const formattedDate =
          FormatUtil.formatSingleDigit(year.value) +
          '-' +
          FormatUtil.formatSingleDigit(month.value) +
          '-' +
          FormatUtil.formatSingleDigit(day.value);
        const date = dayjs(formattedDate, DATE_PARSE_FORMAT);

        if (this.validate(formattedDate, DATE_PARSE_FORMAT)) {
          return date.isSameOrBefore(dayjs(), 'day') ? null : { todayOrBefore: true };
        }
      }

      return null;
    };
  }

  static afterToday(): ValidatorFn {
    return (formGroup: UntypedFormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const formattedDate =
          FormatUtil.formatSingleDigit(year.value) +
          '-' +
          FormatUtil.formatSingleDigit(month.value) +
          '-' +
          FormatUtil.formatSingleDigit(day.value);
        const date = dayjs(formattedDate, DATE_PARSE_FORMAT);

        if (this.validate(formattedDate, DATE_PARSE_FORMAT)) {
          return date.isAfter(dayjs(), 'day') ? null : { afterToday: true };
        }
      }

      return null;
    };
  }

  static todayOrAfter(): ValidatorFn {
    return (formGroup: UntypedFormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const formattedDate =
          FormatUtil.formatSingleDigit(year.value) +
          '-' +
          FormatUtil.formatSingleDigit(month.value) +
          '-' +
          FormatUtil.formatSingleDigit(day.value);
        const date = dayjs(formattedDate, DATE_PARSE_FORMAT);

        if (this.validate(formattedDate, DATE_PARSE_FORMAT)) {
          return date.isSameOrAfter(dayjs(), 'day') ? null : { todayOrAfter: true };
        }
      }

      return null;
    };
  }

  static between(min: dayjs.Dayjs, max: dayjs.Dayjs): ValidatorFn {
    return (formGroup: UntypedFormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const formattedDate =
          FormatUtil.formatSingleDigit(year.value) +
          '-' +
          FormatUtil.formatSingleDigit(month.value) +
          '-' +
          FormatUtil.formatSingleDigit(day.value);
        const date = dayjs(formattedDate, DATE_PARSE_FORMAT);

        if (this.validate(formattedDate, DATE_PARSE_FORMAT)) {
          return date.isBetween(min, max) ? null : { dateBetween: { min, max, actual: date } };
        }
      }

      return null;
    };
  }

  static min(min: dayjs.Dayjs): ValidatorFn {
    return (formGroup: UntypedFormGroup): { [key: string]: any } | null => {
      const { day, month, year } = formGroup.controls;

      if (day.value && month.value && year.value) {
        const formattedDate =
          FormatUtil.formatSingleDigit(year.value) +
          '-' +
          FormatUtil.formatSingleDigit(month.value) +
          '-' +
          FormatUtil.formatSingleDigit(day.value);
        const date = dayjs(formattedDate, DATE_PARSE_FORMAT);

        if (this.validate(formattedDate, DATE_PARSE_FORMAT)) {
          return date.isAfter(min) ? null : { dateMin: { min, actual: date } };
        }
      }

      return null;
    };
  }
}
