import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
})
export class AboutUsComponent implements OnInit {
  constructor(private breadcrumbService: BreadcrumbService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.PAGES_ARTICLES);
  }
}
