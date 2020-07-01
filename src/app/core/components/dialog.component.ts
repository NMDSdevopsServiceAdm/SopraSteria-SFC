import { HostListener, Inject, Directive } from '@angular/core';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Directive()
export class DialogComponent {
  constructor(@Inject(DIALOG_DATA) public data: any, public dialog: Dialog<any>) {}

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (['Escape', 'Esc'].includes(event.key)) {
      this.dialog.close();
    }
  }
}
