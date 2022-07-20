import { Component, OnDestroy, OnInit } from '@angular/core';
import { BackLinkService } from '@core/services/back-link/back-link.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-back-link',
  templateUrl: './new-back-link.component.html',
})
export class NewBackLinkComponent implements OnInit, OnDestroy {
  public back = false;
  private subscriptions: Subscription = new Subscription();

  constructor(private backLinkService: BackLinkService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.backLinkService.back$.subscribe((back) => {
        this.back = back;
      }),
    );
  }

  public goBack(event: Event): void {
    event.preventDefault();
    this.backLinkService.goBack();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
