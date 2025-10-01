import { ActivatedRoute } from '@angular/router';
import lodash from 'lodash';

export class MockActivatedRoute {
  parent: any;
  params: any;
  fragment: any;
  data: any;
  snapshot = {};
  url: any;

  constructor(options) {
    this.parent = options.parent;
    this.params = options.params;
    this.fragment = options.fragment;
    this.data = options.data;
    if (options.snapshot) {
      this.snapshot = options.snapshot;
    }
    if (options.url) {
      this.url = options.url;
    }
  }
}

export function provideActivatedRoute(overrides: any = {}) {
  const valueFromOverrides = { snapshot: overrides?.snapshot ?? {}, parent: overrides?.parent };
  const patchForRouterLinkToWork = { snapshot: { root: { children: [], url: ['/'] } } };
  const patchValue = lodash.merge(patchForRouterLinkToWork, valueFromOverrides);

  return {
    provide: ActivatedRoute,
    useValue: patchValue,
  };
}
