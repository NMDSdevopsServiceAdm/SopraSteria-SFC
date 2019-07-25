import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wdf-confirmation-panel',
  templateUrl: './wdf-confirmation-panel.component.html',
})
export class WdfConfirmationPanelComponent {
  @Input() exitable = true;
  @Output() confirmed = new EventEmitter();
  @Output() exited = new EventEmitter();

  public onConfirm(event: Event) {
    event.preventDefault();
    this.confirmed.emit();
  }

  public onExit(event: Event) {
    event.preventDefault();
    this.exited.emit();
  }
}
