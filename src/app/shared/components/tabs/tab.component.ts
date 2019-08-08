import { Component, Input, OnInit } from '@angular/core';
import * as slugify from 'slugify';

@Component({
  selector: 'app-tab',
  template: `
    <section
      id="{{ slug }}"
      class="govuk-tabs__panel"
      [attr.aria-labelledby]="'tab_' + slug"
      role="tabpanel"
      [hidden]="!active"
    >
      <ng-content></ng-content>
    </section>
  `,
})
export class TabComponent implements OnInit {
  @Input() title;
  @Input() active = false;
  @Input() alert = false;
  public slug: string;

  ngOnInit() {
    this.slug = slugify.default(this.title, { lower: true });
  }
}
