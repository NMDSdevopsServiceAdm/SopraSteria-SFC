import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportsService } from '@core/services/reports.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-workplace-tab',
  templateUrl: './workplace-tab.component.html',
})
export class WorkplaceTabComponent implements OnInit, OnDestroy {
  public workplace: any;
  public reportDetails: any;
  public updateWorkplace: boolean;
  @Input() displayWDFReport;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private establishmentService: EstablishmentService,
    private reportsService: ReportsService
  ) {}

  ngOnInit() {
    const workplaceId = parseInt(localStorage.getItem('establishmentId'), 10);
    this.subscriptions.add(
      this.establishmentService
        .getEstablishment(workplaceId)
        .pipe(take(1))
        .subscribe(workplace => {
          this.workplace = workplace;
        })
    );

    this.subscriptions.add(
      this.establishmentService
        .getEmployerType()
        .pipe(take(1))
        .subscribe(d => {
          this.updateWorkplace = !d.employerType;
        })
    );

    this.subscriptions.add(
      this.reportsService.reportDetails$.subscribe(reportDetails => this.reportDetails = reportDetails)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
