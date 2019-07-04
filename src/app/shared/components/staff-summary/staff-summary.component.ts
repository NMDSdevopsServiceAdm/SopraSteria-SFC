import { Component, Input } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-staff-summary',
  templateUrl: './staff-summary.component.html',
})
export class StaffSummaryComponent {
  @Input() workers: Array<Worker>;
  @Input() wdfReportEnabled = false;

  public lastUpdated(timestamp: string): string {
    const lastUpdated: moment.Moment = moment(timestamp);
    const isToday: boolean = moment().isSame(lastUpdated, 'day');
    return isToday ? 'Today' : lastUpdated.format('D MMMM YYYY');
  }
}
