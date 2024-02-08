import { Component, OnDestroy, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-back-link',
  templateUrl: './back-link.component.html',
})
export class BackLinkComponent implements OnInit, OnDestroy {
  public back: URLStructure = null;
  private subscriptions: Subscription = new Subscription();

  constructor(private backService: BackService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.backService.back$.subscribe((back) => {
        this.back = back;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
