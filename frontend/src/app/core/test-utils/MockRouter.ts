import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

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
