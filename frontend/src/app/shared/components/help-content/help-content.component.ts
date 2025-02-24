import { Component, Input } from '@angular/core';
import { HelpPage } from '@core/model/help-pages.model';

@Component({
  selector: 'app-help-content',
  templateUrl: './help-content.component.html',
  styleUrls: ['./help-content.component.scss'],
})
export class HelpContentComponent {
  @Input() helpPage: HelpPage;

  constructor() {}
}
