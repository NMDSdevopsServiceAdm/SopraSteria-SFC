import { Component, Input } from '@angular/core';
import { URLStructure } from '@core/model/url.model';

@Component({
    selector: 'app-submit-exit-buttons',
    templateUrl: './submit-exit-buttons.component.html',
    standalone: false
})
export class SubmitExitButtonsComponent {
  @Input() public cta?: string;
  @Input() public exit?: string;
  @Input() public return?: URLStructure;
}
