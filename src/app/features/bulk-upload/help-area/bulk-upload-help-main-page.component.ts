import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BulkUploadTopTip } from '@core/model/bulk-upload-top-tips.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-bulk-upload-help-main-page',
  templateUrl: './bulk-upload-help-main-page.component.html',
  styleUrls: ['./bulk-upload-help-main-page.component.scss'],
})
export class BulkUploadHelpMainPageComponent implements OnInit {
  public topTipsList: BulkUploadTopTip[];

  constructor(private route: ActivatedRoute, private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.topTipsList = this.route.snapshot.data.topTipsList.data;
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD_HELP);
  }
}
