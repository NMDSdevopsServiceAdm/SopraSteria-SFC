import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-inset-text',
  templateUrl: './inset-text.component.html',
})
export class InsetTextComponent {
  @Input() color: string;
  @Input() closable = false;
  @Input() removeBottomMargin = false;
  @Output() closed = new EventEmitter();

  constructor() {}

  public close(event: Event) {
    event.preventDefault();
    this.closed.emit();
  }
}
