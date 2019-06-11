import 'core-js';

import { Component, OnInit, enableProdMode, ViewChild, Renderer, ElementRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TitleService } from '@core/services/title.service';
import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2/gst';
import { filter } from 'rxjs/operators';

enableProdMode();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {
  title = 'ng-sfc-v2';
  @ViewChild('main') main: ElementRef;
  @ViewChild('skip') skip: ElementRef;

  constructor(
    private router: Router,
    private titleService: TitleService,
    private angulartics: Angulartics2GoogleGlobalSiteTag,
    private renderer: Renderer
  ) {
    this.titleService.init('Skills for Care');
    this.angulartics.startTracking();
  }

  focusSkip() {
    window.scrollTo(0, 0);
    if (document.activeElement !== document.body) {
      (document.activeElement as HTMLElement).blur();
    }
    this.renderer.invokeElementMethod(this.skip.nativeElement, 'focus');
  }

  skipLink() {
    this.renderer.invokeElementMethod(this.main.nativeElement, 'focus');
  }
  
  ngOnInit() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      window.scrollTo(0, 0);
    });

    // if (localStorage.getItem('auth-token')) {
    //   localStorage.clear();
    // }
  }
}