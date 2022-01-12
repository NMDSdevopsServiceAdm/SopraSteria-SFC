import { Component, OnInit } from '@angular/core';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-bulk-upload-flowchart',
  templateUrl: './bulk-upload-flowchart.component.html',
  styleUrls: ['./bulk-upload-flowchart.component.scss'],
})
export class BulkUploadFlowchartComponent implements OnInit {
  constructor(public backService: BackService) {}

  ngOnInit(): void {
    this.setBackLink();
  }

  // Needs implementing
  public setBackLink(): void {
    // const backLinkUrl = 'bulk-upload';
    this.backService.setBackLink({ url: ['/'] });
  }

  // Needs implementing
  public printPage(event: Event): void {
    event.preventDefault();
  }
}
