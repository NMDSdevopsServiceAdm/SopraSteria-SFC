import { Location } from '@angular/common';
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
  public showBackLink = false;
  private subscriptions: Subscription = new Subscription();

  constructor(private backService: BackService, private location: Location) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.backService.back$.subscribe((back) => {
        this.back = back;
      }),
    );

    this.subscriptions.add(
      this.backService.backLink$.subscribe((show) => {
        this.showBackLink = show;
      }),
    );
  }

  public goBack(event: Event): void {
    event.preventDefault();
    console.log('***** go back *****');
    this.location.back();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
