import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
})
export class ContactUsComponent implements OnInit {
  constructor(private breadcrumbSerivce: BreadcrumbService) {}

  ngOnInit() {
    this.breadcrumbSerivce.show(JourneyType.PUBLIC);
  }
}
