import { Component, EventEmitter, Input, Output } from '@angular/core';
import { URLStructure } from '@core/model/url.model';

@Component({
  selector: 'app-wdf-confirmation-panel',
  templateUrl: './wdf-confirmation-panel.component.html',
})
export class WdfConfirmationPanelComponent {
  @Input() exitUrl: URLStructure;
  @Output() confirmed = new EventEmitter();

  public onConfirm(event: Event) {
    event.preventDefault();
    this.confirmed.emit();
  }
}
