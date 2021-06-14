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
    this.snapshot = options.snapshot;
    this.url = options.url;
  }
}
