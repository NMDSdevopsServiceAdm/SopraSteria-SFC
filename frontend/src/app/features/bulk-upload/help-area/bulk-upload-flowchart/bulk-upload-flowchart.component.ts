import { Component, OnInit } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';

@Component({
    selector: 'app-bulk-upload-flowchart',
    templateUrl: './bulk-upload-flowchart.component.html',
    styleUrls: ['./bulk-upload-flowchart.component.scss'],
    standalone: false
})
export class BulkUploadFlowchartComponent implements OnInit {
  constructor(public backLinkService: BackLinkService) {}

  ngOnInit(): void {
    this.backLinkService.showBackLink();
  }
}
