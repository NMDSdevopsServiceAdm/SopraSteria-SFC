import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
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
  public summaryReturnUrl: URLStructure;
  @Input() displayWDFReport;
  private subscriptions: Subscription = new Subscription();

  constructor(private establishmentService: EstablishmentService, private reportsService: ReportsService) {}

  ngOnInit() {
    const workplaceId = parseInt(localStorage.getItem('establishmentId'), 10);

    this.summaryReturnUrl = { url: ['/dashboard'], fragment: 'workplace' };

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
      this.reportsService.reportDetails$.subscribe(reportDetails => (this.reportDetails = reportDetails))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
