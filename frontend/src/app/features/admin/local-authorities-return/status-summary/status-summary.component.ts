import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LA, LAs } from '@core/model/admin/local-authorities-return.model';

type LAStatus =
  | 'Not updated'
  | 'Update, complete'
  | 'Update, not complete'
  | 'Confirmed, complete'
  | 'Confirmed, not complete';

type LAStatusSummary = Record<LAStatus, number>;

@Component({
  selector: 'app-status-summary',
  templateUrl: './status-summary.component.html',
  standalone: false,
})
export class StatusSummaryComponent {
  public localAuthorities: LAs;
  public statusSummary: LAStatusSummary;

  public signedOffNumber: number;
  public activeNumber: number;
  public failedDataQualityNumber: number;
  public noActivityNumber: number;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.localAuthorities = this.route.snapshot.data.localAuthorities;
    this.statusSummary = this.getStatusSummaryNumbers();

    this.signedOffNumber = this.statusSummary['Confirmed, complete'];
    this.activeNumber = this.statusSummary['Update, complete'] + this.statusSummary['Update, not complete'];
    this.failedDataQualityNumber = this.statusSummary['Confirmed, not complete'];
    this.noActivityNumber = this.statusSummary['Not updated'];
  }

  private getStatusSummaryNumbers(): LAStatusSummary {
    const flatLas = Object.values(this.localAuthorities).flat() as LA[];

    const initialValues = {
      'Not updated': 0,
      'Update, complete': 0,
      'Update, not complete': 0,
      'Confirmed, complete': 0,
      'Confirmed, not complete': 0,
    } as LAStatusSummary;

    return flatLas.reduce((acc, la) => {
      acc[la.status]++;
      return acc;
    }, initialValues);
  }
}
