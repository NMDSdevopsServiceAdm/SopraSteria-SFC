import { Location } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-back-link',
  templateUrl: './new-back-link.component.html',
})
export class NewBackLinkComponent implements OnInit, OnDestroy {
  public showBackLink = false;
  private subscriptions: Subscription = new Subscription();
  @Input() showBanner: boolean;

  constructor(private backLinkService: BackLinkService, private location: Location,  private breadcrumbService: BreadcrumbService,) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.backLinkService.backLink$.subscribe((backLink) => {
        this.showBackLink = backLink;
      }),
    );
  }

  public goBack(event: Event): void {
    this.breadcrumbService.canShowBanner = this.showBanner;
    event.preventDefault();
    this.location.back();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
