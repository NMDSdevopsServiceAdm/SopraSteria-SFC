import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CookiePolicyService } from '@core/services/cookie-policy.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrl: './cookie-banner.component.scss',
})
export class CookieBannerComponent implements OnInit, AfterViewInit {
  private _isShowing: BehaviorSubject<boolean> = new BehaviorSubject(null);

  @ViewChild('cookieBanner') cookieBanner: ElementRef;

  constructor(private cookiePolicyService: CookiePolicyService, private router: Router) {}

  ngOnInit(): void {
    this.checkIfShouldShowUp();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cookieBanner.nativeElement.focus();
    }, 1000);
  }

  get isShowing(): boolean {
    return this._isShowing.value;
  }

  private checkIfShouldShowUp() {
    if (!this.cookiePolicyService.hasAnsweredCookiePreferences) {
      this._isShowing.next(true);
    }
  }

  public acceptAnalyticCookies() {
    this.cookiePolicyService.acceptAnalyticCookies();
    this._isShowing.next(false);
  }

  public rejectAnalyticCookies() {
    this.cookiePolicyService.rejectAnalyticCookies();
    this._isShowing.next(false);
  }
}
