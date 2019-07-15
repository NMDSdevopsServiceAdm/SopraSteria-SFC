import 'core-js';

import { Component, ElementRef, enableProdMode, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { NestedRoutesService } from '@core/services/nested-routes.service';
import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2/gst';
import { filter } from 'rxjs/operators';

enableProdMode();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private baseTitle = 'Skills for Care';
  @ViewChild('top') top: ElementRef;
  @ViewChild('content') content: ElementRef;

  constructor(
    private router: Router,
    private title: Title,
    private nestedRoutesService: NestedRoutesService,
    private angulartics: Angulartics2GoogleGlobalSiteTag
  ) {
    this.nestedRoutesService.routes$.subscribe(routes => {
      if (routes) {
        const titles = routes.reduce(
          (titleArray, breadcrumb) => {
            titleArray.push(breadcrumb.title);
            return titleArray;
          },
          [this.baseTitle]
        );

        this.title.setTitle(titles.join(' - '));
      }
    });

    this.angulartics.startTracking();
  }

  ngOnInit() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      window.scrollTo(0, 0);
      if (document.activeElement !== document.body) {
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
