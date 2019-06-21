import { Component, OnDestroy, OnInit } from '@angular/core';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
})
export class AlertsComponent implements OnInit, OnDestroy {
  public displayUploadCompleteAlert = false;
  private subscriptions: Subscription = new Subscription();

  constructor(private bulkUploadService: BulkUploadService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.bulkUploadService.uploadComplete$.subscribe(uploadComplete => {
        this.displayUploadCompleteAlert = uploadComplete;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
