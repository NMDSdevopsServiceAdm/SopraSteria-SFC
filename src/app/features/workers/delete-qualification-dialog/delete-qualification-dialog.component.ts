import { Component, Inject, HostListener } from '@angular/core';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-delete-qualification-dialog',
  templateUrl: './delete-qualification-dialog.component.html',
})
export class DeleteQualificationDialogComponent {
  constructor(@Inject(DIALOG_DATA) public data, public dialog: Dialog<DeleteQualificationDialogComponent>) {}

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
      if (event.keyCode === 27) {
          this.dialog.close();
      }
  }

  close(confirm: boolean) {
    this.dialog.close(confirm);
  }
}
