import { Component, Input, OnInit } from '@angular/core';
import * as slugify from 'slugify';

@Component({
  selector: 'app-new-tab',
  template: `
    <section
      id="{{ slug }}"
      [class.govuk-tabs__panel--hidden]="!active"
      [attr.aria-labelledby]="'tab_' + slug"
      role="tabpanel"
    >
      <ng-content></ng-content>
    </section>
  `,
})
export class NewTabComponent implements OnInit {
  @Input() title;
  @Input() active = false;
  @Input() alert = false;
  @Input() redAlert = false;
  @Input() greenTick = false;
  @Input() redCross = false;

  public slug: string;

  ngOnInit() {
    this.slug = slugify.default(this.title, { lower: true });
  }
}
