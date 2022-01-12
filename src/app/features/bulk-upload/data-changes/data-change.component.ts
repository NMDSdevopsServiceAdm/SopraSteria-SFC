import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataChangeService } from '@core/services/data-change.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-data-change',
  templateUrl: './data-change.component.html',
})
export class BulkUploadDataChangeComponent {
  public datachange: any;
  public workplaceUid: string;
  private subscriptions: Subscription = new Subscription();
  constructor(private route: ActivatedRoute, private dataChangeService: DataChangeService) {}

  ngOnInit(): void {
    this.workplaceUid = this.route.snapshot.data.primaryWorkplace.uid;
    this.datachange = this.route.snapshot.data.dataChange.data.last_updated;

    this.updateLastUpdatedDataChangeDate();
  }

  public updateLastUpdatedDataChangeDate() {
    const lastUpdated = this.datachange;
    this.subscriptions = this.dataChangeService
      .updateBUDataChangeLastUpdated(this.workplaceUid, lastUpdated)
      .subscribe((err) => console.log(err));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
