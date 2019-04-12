import 'core-js';

import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

declare let gtag: Function;

function getWindow(): any {
  return window;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'ng-sfc-v2';
  gaid: string;

  constructor(private router: Router) {
    if (getWindow().gaid) {
      this.gaid = getWindow().gaid;
    }
  }

  ngOnInit() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(event => event as NavigationEnd)
      )
      .subscribe(event => {
        console.log(this.gaid, { page_path: event.urlAfterRedirects });
        gtag('config', this.gaid, {
          page_path: event.urlAfterRedirects,
        });
        window.scrollTo(0, 0);
      });

    if (localStorage.getItem('auth-token')) {
      localStorage.clear();
    }
  }
}
