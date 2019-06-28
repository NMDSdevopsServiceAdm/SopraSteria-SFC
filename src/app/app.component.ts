import 'core-js';

import { Component, ElementRef, enableProdMode, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TitleService } from '@core/services/title.service';
import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2/gst';
import { filter } from 'rxjs/operators';

enableProdMode();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private title = 'Skills for Care';
  @ViewChild('top') top: ElementRef;
  @ViewChild('content') content: ElementRef;

  constructor(
    private router: Router,
    private titleService: TitleService,
    private angulartics: Angulartics2GoogleGlobalSiteTag
  ) {
    this.titleService.init(this.title);
    this.angulartics.startTracking();
  }

  ngOnInit() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      window.scrollTo(0, 0);
      if (document.activeElement !== document.body) {
        console.log(document.activeElement);
        (document.activeElement as HTMLElement).blur();
      }
      this.top.nativeElement.focus();
    });
  }

  public skip(event: Event) {
    event.preventDefault();
    this.content.nativeElement.focus();
  }
}
