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
