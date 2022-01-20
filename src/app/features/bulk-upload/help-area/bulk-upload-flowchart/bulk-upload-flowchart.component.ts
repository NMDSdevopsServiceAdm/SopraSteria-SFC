import { Component, OnInit } from '@angular/core';
import { BackService } from '@core/services/back.service';
import { BulkUploadTopTipsService } from '@core/services/bulk-upload/bulk-upload-top-tips.service';

@Component({
  selector: 'app-bulk-upload-flowchart',
  templateUrl: './bulk-upload-flowchart.component.html',
  styleUrls: ['./bulk-upload-flowchart.component.scss'],
})
export class BulkUploadFlowchartComponent implements OnInit {
  constructor(public backService: BackService, private bulkUploadTopTipsService: BulkUploadTopTipsService) {}

  ngOnInit(): void {
    this.setBackLink();
  }

  public setBackLink(): void {
    const returnUrl = this.bulkUploadTopTipsService.returnTo
      ? this.bulkUploadTopTipsService.returnTo
      : { url: ['/bulk-upload', 'get-help'] };

    this.backService.setBackLink(returnUrl);
  }
}
