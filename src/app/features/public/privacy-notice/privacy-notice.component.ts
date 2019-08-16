import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-privacy-notice',
  templateUrl: './privacy-notice.component.html',
})
export class PrivacyNoticeComponent implements OnInit {
  constructor(private breadcrumbSerivce: BreadcrumbService) {}

  ngOnInit() {
    this.breadcrumbSerivce.show(JourneyType.PUBLIC);
  }
}
