import { Component, EventEmitter, Input, Output } from '@angular/core';

export enum Status {
  TODO = 'todo',
  SUCCESS = 'success',
  WARNING = 'warning',
}

@Component({
  selector: 'app-inset-text',
  templateUrl: './inset-text.component.html',
})
export class InsetTextComponent {
  @Input() color: Status;
  @Input() closable = false;
  @Output() closed = new EventEmitter();

  constructor() {}

  public close(event: Event) {
    event.preventDefault();
    this.closed.emit();
  }
}
