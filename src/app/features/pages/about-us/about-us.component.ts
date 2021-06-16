import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Page } from '@core/model/page.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
})
export class AboutUsComponent implements OnInit {
  public subscriptions = new Subscription();
  public aboutUsContent: Page;

  constructor(private breadcrumbService: BreadcrumbService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.PUBLIC);
    this.subscriptions.add(
      this.route.url.subscribe(() => {
        this.aboutUsContent = this.route.snapshot.data.pages?.data[0];
      }),
    );
  }
}
