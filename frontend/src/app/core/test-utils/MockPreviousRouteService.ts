import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PreviousRouteService } from '@core/services/previous-route.service';

@Injectable()
export class MockPreviousRouteService extends PreviousRouteService {
  public previousUrl: string;

  public static factory(previousUrl: string) {
    return (router: Router) => {
      const service = new MockPreviousRouteService(router);
      service.previousUrl = previousUrl;
      return service;
    };
  }
}
