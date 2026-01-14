import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LAs } from '@core/model/admin/local-authorities-return.model';

@Component({
  selector: 'app-status-summary',
  templateUrl: './status-summary.component.html',
  standalone: false,
})
export class StatusSummaryComponent {
  public localAuthorities: LAs;

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.localAuthorities = this.route.snapshot.data.localAuthorities;
  }

  public signedOffNumber() {
    return this.getStatusSummaryNumbers()['Confirmed, complete'];
  }

  public activeNumber() {
    return this.getStatusSummaryNumbers()['Update, complete'] + this.getStatusSummaryNumbers()['Update, not complete'];
  }

  public failedDataQualityNumber() {
    return this.getStatusSummaryNumbers()['Confirmed, not complete'];
  }
  public noActivityNumber() {
    return this.getStatusSummaryNumbers()['Not updated'];
  }

  private getStatusSummaryNumbers() {
    const flatLas = Object.values(this.localAuthorities).flat();

    const initialValues = {
      'Not updated': 0,
      'Update, complete': 0,
      'Update, not complete': 0,
      'Confirmed, complete': 0,
      'Confirmed, not complete': 0
    };

    return flatLas.reduce((acc, la) => {
      acc[la.status]++;
      return acc;
    }, initialValues);
  }
}
