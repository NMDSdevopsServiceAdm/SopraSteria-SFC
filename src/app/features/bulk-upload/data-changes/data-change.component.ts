import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { DataChange } from '@core/model/data-change.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DataChangeService } from '@core/services/data-change.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-data-change',
  templateUrl: './data-change.component.html',
})
export class BulkUploadDataChangeComponent implements OnInit {
  public datachange: DataChange;
  public workplaceUid: string;
  private subscriptions: Subscription = new Subscription();
  constructor(
    private route: ActivatedRoute,
    private dataChangeService: DataChangeService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.workplaceUid = this.route.snapshot.data?.primaryWorkplace.uid;
    this.datachange = this.route.snapshot.data?.dataChange.data;

    this.updateLastUpdatedDataChangeDate();
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD_HELP);
  }

  public updateLastUpdatedDataChangeDate() {
    const lastUpdated = this.datachange.last_updated;

    this.subscriptions.add(
      this.dataChangeService.updateBUDataChangeLastUpdated(this.workplaceUid, lastUpdated).subscribe(),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
