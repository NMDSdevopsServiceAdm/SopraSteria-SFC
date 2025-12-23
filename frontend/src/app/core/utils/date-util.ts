import dayjs from 'dayjs';
import { FormatUtil } from './format-util';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';
import { DateValidator } from '@shared/validators/date.validator';

type FormGroupDateValues = { day: number; month: number; year: number };

export class DateUtil {
  public static getDateForOneYearAgo(): string {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 1);
    return FormatUtil.formatDateToLocaleDateString(today);
  }

  public static toDayjs(input: string | FormGroupDateValues): dayjs.Dayjs {
    if (!input) return null;

    let dateString: string;
    if (typeof input === 'string') {
      dateString = input;
    } else {
      const { day, month, year } = input;
      if (!day || !month || !year || year < 1000) return null;

      dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }

    const isValid = DateValidator.validate(dateString, DATE_PARSE_FORMAT);

    return isValid ? dayjs(dateString, DATE_PARSE_FORMAT) : null;
  }

  public static dayJStoFormDate(date: dayjs.Dayjs): FormGroupDateValues {
    if (!date?.isValid) {
      return null;
    }

    return {
      day: date.date(),
      month: date.month() + 1,
      year: date.year(),
    };
  }

  public static toFormDate(input: string | dayjs.Dayjs): FormGroupDateValues {
    if (typeof input === 'string') {
      return DateUtil.dayJStoFormDate(DateUtil.toDayjs(input));
    }
    return DateUtil.dayJStoFormDate(input);
  }
}

export class FormatDate {
  public static formatUKDate(
    dateStr: string | null | undefined,
    options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
  ): string {
    if (!dateStr) return '-'; // handle empty/null
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // handle invalid dates
    return date.toLocaleDateString('en-GB', options);
  }
}
