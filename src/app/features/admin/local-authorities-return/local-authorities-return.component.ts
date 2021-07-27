import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-local-authorities-return',
  templateUrl: './local-authorities-return.component.html',
})
export class LocalAuthoritiesReturnComponent implements OnInit {
  constructor(private breadcrumbService: BreadcrumbService) {}
  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.ADMIN);
  }
}
