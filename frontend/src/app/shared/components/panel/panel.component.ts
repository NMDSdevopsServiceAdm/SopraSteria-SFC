import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-panel',
    templateUrl: './panel.component.html',
    standalone: false
})
export class PanelComponent {
  @Input() title: string;
}
