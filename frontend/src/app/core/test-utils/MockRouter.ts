import { Injectable } from '@angular/core';
import { Router, RouterState, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class MockRouter extends Router {
  public static factory(overrides: any = {}) {
    return () => {
      const service = new MockRouter();

      Object.keys(overrides).forEach((overrideName) => {
        if (overrideName === 'url') {
          Object.defineProperty(service, 'url', { get: () => overrides[overrideName] });
          return;
        }
        service[overrideName] = overrides[overrideName];
      });

      return service;
    };
  }
}

export const setUpRouterState = (url: string, router: Router) => {
  const mockRouterState: Partial<RouterState> = {
    snapshot: { url, root: { url: [] } } as RouterStateSnapshot,
  };

  return spyOnProperty(router, 'routerState', 'get').and.returnValue(mockRouterState as RouterState);
};
