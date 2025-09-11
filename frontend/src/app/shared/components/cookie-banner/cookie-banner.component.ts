import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

interface CookiePolicy {
  essential: boolean;
  analytics: boolean;
}

@Component({
  selector: 'app-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrl: './cookie-banner.component.scss',
})
export class CookieBannerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('cookieBanner') cookieBanner: ElementRef;

  constructor(private cookieService: CookieService, private router: Router) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cookieBanner.nativeElement.focus();
    }, 1000);
  }

  ngOnDestroy(): void {}
}
