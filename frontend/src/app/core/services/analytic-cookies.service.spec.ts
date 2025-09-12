import { TestBed } from '@angular/core/testing';

import { AnalyticCookiesService } from './analytic-cookies.service';
import { WindowToken } from './window';
import { DOCUMENT } from '@angular/common';

fdescribe('AnalyticCookiesService', () => {
  let service: AnalyticCookiesService;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: WindowToken, useValue: {} }],
    });
    service = TestBed.inject(AnalyticCookiesService);
    document = TestBed.inject(DOCUMENT);

    document.head.innerHTML = ''; // reset document object
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startGoogleAnalyticsTracking', () => {
    it('should inject a script tag for Google Tag Manager to <head>', async () => {
      service.startGoogleAnalyticsTracking();

      const scriptTag = document.head.querySelector('script');

      expect(scriptTag).toBeTruthy();
      expect(scriptTag.type).toEqual('text/javascript');
    });

    it('should not inject the script tag twice if it is already there', async () => {
      service.startGoogleAnalyticsTracking();
      service.startGoogleAnalyticsTracking();

      const allScriptTags = document.head.querySelectorAll('script');
      expect(allScriptTags.length).toEqual(1);
    });

    it('should push a gtm start event to window.dataLayer', async () => {
      service.startGoogleAnalyticsTracking();

      const window = TestBed.inject(WindowToken) as Window;

      expect(window.dataLayer.length).toEqual(1);
      expect(window.dataLayer[0]).toEqual({ 'gtm.start': jasmine.any(Number), event: 'gtm.js' });
    });
  });

  describe('googleAnalyticsStarted', () => {
    it('should return true if google analytics has started', async () => {
      service.startGoogleAnalyticsTracking();

      expect(service.googleAnalyticsStarted).toEqual(true);
    });

    it('should return false if google analytics has not started', async () => {
      expect(service.googleAnalyticsStarted).toEqual(false);
    });
  });
});
