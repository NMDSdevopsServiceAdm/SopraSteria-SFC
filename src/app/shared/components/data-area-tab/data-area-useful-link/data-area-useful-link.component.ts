import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-data-area-useful-link',
  templateUrl: './data-area-useful-link.component.html',
})
export class DataAreaUsefulLinkComponent {
  @Input() linkTitle: string;
  @Input() linkUrl: string;
  @Input() linkDescription: string;
}
