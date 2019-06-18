import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { uniq } from 'lodash';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private title: Title) {}

  public init(baseTitle: string = ''): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          const titleArray: string[] = [];
          while (route) {
            if (route.snapshot.data.title) {
              titleArray.push(route.snapshot.data.title);
            }
            route = route.firstChild;
          }
          return uniq(titleArray);
        })
      )
      .subscribe(titleArray => {
        const title = [baseTitle].concat(titleArray);
        this.setTitle(title.join(' - '));
      });
  }

  public setTitle(title: string) {
    this.title.setTitle(title);
  }
}
