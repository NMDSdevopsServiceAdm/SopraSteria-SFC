import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterState, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class MockRouter extends Router {
  public static factory(overrides: any = {}) {
    return () => {
      const service = new MockRouter();

      Object.keys(overrides).forEach((overrideName) => {
        service[overrideName] = overrides[overrideName];
      });

      return service;
    };
  }
}

export const setUpRouterState = (url: string, router: Router) => {
  const mockActivatedRouteSnapshot: Partial<ActivatedRouteSnapshot> = {
    url: [],
  };

  const mockRouterStateSnapshot: Partial<RouterStateSnapshot> = {
    url,
    root: mockActivatedRouteSnapshot as ActivatedRouteSnapshot,
  };

  const mockRouterState: Partial<RouterState> = {
    snapshot: mockRouterStateSnapshot as RouterStateSnapshot,
  };

  return spyOnProperty(router, 'routerState', 'get').and.returnValue(mockRouterState as RouterState);
};
