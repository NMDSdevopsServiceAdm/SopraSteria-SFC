import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-inset-text',
    templateUrl: './inset-text.component.html',
    styleUrls: ['./inset-text.component.scss'],
    standalone: false
})
export class InsetTextComponent {
  @Input() color: string;
  @Input() closable = false;
  @Input() removeBottomMargin = false;
  @Input() removeTopMargin = false;
  @Input() linkTextForAlert: string;
  @Input() noFloatRight: boolean;
  @Output() closed = new EventEmitter();
  @Output() alertLinkClicked = new EventEmitter();

  public close(event: Event) {
    event.preventDefault();
    this.closed.emit();
  }

  public alertLinkClick(event: Event) {
    event.preventDefault();
    this.alertLinkClicked.emit(event);
  }
}
