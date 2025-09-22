import { Inject, Injectable } from '@angular/core';
import { WindowToken } from './window';
import { DOCUMENT } from '@angular/common';

const googleTagManagerId = 'GTM-WZKV3HJ';

@Injectable({
  providedIn: 'root',
})
export class AnalyticCookiesService {
  constructor(@Inject(WindowToken) private window: Window, @Inject(DOCUMENT) private document: Document) {}

  public startGoogleAnalyticsTracking(): void {
    try {
      if (this.googleAnalyticsTagAlreadyInserted()) {
        return;
      }

      const window = this.window;
      const document = this.document;

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

      const scriptTag = document.createElement('script', {});
      scriptTag.async = true;
      scriptTag.type = 'text/javascript';
      scriptTag.src = `https://www.googletagmanager.com/gtm.js?id=${googleTagManagerId}`;

      document.head.appendChild(scriptTag);
    } catch (e) {
      console.log('failed to initiate google tag manager');
      console.error(e);
    }
  }

  private googleAnalyticsTagAlreadyInserted(): boolean {
    try {
      const gaScriptTagsFound = this.document.querySelectorAll('[src*="googletagmanager"]');
      return gaScriptTagsFound?.length > 0;
    } catch (e) {
      return false;
    }
  }
}
