import { Component, Input, OnInit } from '@angular/core';
import * as slugify from 'slugify';

@Component({
  selector: 'app-tab',
  template: `
    <section
      id="{{ slug }}"
      role="tabpanel"
      [attr.aria-labelledby]="'tab_'+ slug"
      class="govuk-tabs__panel"
      [hidden]="!active">
      <ng-content></ng-content>
    </section>
  `,
})
export class TabComponent implements OnInit {
  @Input() title;
  @Input() active = false;
  public slug: string;

  ngOnInit() {
    this.slug = slugify.default(this.title, { lower: true });
  }
}
