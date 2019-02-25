import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tab',
  template: `
    <section class="govuk-tabs__panel" [hidden]="!active">
      <ng-content></ng-content>
    </section>
  `,
})
export class TabComponent {
  @Input() title;
  @Input() active = false;

  constructor() {
    console.log(this.title);
  }
}
