import { Component, Input } from '@angular/core';
import { URLStructure } from '@core/model/url.model';

@Component({
  selector: 'app-submit-exit-buttons',
  templateUrl: './submit-exit-buttons.component.html',
})
export class SubmitExitButtonsComponent {
  @Input() public return?: URLStructure;
}
