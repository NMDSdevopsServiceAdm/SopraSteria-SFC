import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { DataChange } from '@core/model/data-change.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DataChangeService } from '@core/services/data-change.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-data-change',
  templateUrl: './data-change.component.html',
})
export class BulkUploadDataChangeComponent implements OnInit, OnDestroy {
  public datachange: DataChange;
  public workplaceUid: string;
  private subscriptions: Subscription = new Subscription();
  constructor(
    private route: ActivatedRoute,
    private dataChangeService: DataChangeService,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.workplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.datachange = this.route.snapshot.data?.dataChange.data;

    this.updateLastUpdatedDataChangeDate();
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);
  }

  public updateLastUpdatedDataChangeDate() {
    const lastUpdated = this.datachange.last_updated;

    this.subscriptions.add(
      this.dataChangeService.updateBUDataChangeLastUpdated(this.workplaceUid, lastUpdated).subscribe(),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
