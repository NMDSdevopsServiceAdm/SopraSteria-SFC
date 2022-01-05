import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-public-page',
  templateUrl: './public-page.component.html',
})
export class PublicPageComponent implements OnInit, OnDestroy {
  public returnToHomeButton: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(private breadcrumbService: BreadcrumbService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.subscriptions.add(this.route.data.subscribe((data) => (this.returnToHomeButton = data.returnToHomeButton)));
    this.breadcrumbService.show(JourneyType.PUBLIC);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
