import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-inset-text',
  templateUrl: './inset-text.component.html',
})
export class InsetTextComponent {
  @Input() color: string;
  @Input() closable = false;
  @Input() removeBottomMargin = false;
  @Input() removeTopMargin = false;
  @Input() linkTextForAlert: string;
  @Output() closed = new EventEmitter();
  @Output() alertLinkClicked = new EventEmitter();

  constructor() {}

  public close(event: Event) {
    event.preventDefault();
    this.closed.emit();
  }

  alertLinkClick(event: Event) {
    event.preventDefault();
    this.alertLinkClicked.emit(event);
  }
}
