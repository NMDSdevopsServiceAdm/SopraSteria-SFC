import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-back-link',
  templateUrl: './new-back-link.component.html',
})
export class NewBackLinkComponent implements OnInit, OnDestroy {
  public showBackLink = false;
  private subscriptions: Subscription = new Subscription();

  constructor(private backLinkService: BackLinkService, private location: Location) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.backLinkService.backLink$.subscribe((backLink) => {
        this.showBackLink = backLink;
      }),
    );
  }

  public goBack(event: Event): void {
    event.preventDefault();
    this.location.back();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
