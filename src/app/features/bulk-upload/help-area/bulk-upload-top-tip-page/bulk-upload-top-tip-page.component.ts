import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BulkUploadTopTip } from '@core/model/bulk-upload-top-tips.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-bulk-upload-top-tip-page',
  templateUrl: './bulk-upload-top-tip-page.component.html',
})
export class BulkUploadTopTipPageComponent implements OnInit {
  public topTipsList: BulkUploadTopTip[];
  public topTip: BulkUploadTopTip;

  constructor(private route: ActivatedRoute, private breadCrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.topTipsList = this.route.snapshot.data.topTipsList.data;
    this.topTip = this.route.snapshot.data.topTip?.data[0];
    this.breadCrumbService.show(JourneyType.BULK_UPLOAD_HELP);
  }
}
