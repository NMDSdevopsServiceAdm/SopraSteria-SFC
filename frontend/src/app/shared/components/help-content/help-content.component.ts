//content
//title

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-help-content',
  templateUrl: './help-content.component.html',
})
export class HelpContentComponent {
  @Input() title: string;
  @Input() content: string;

  constructor() {}
}
