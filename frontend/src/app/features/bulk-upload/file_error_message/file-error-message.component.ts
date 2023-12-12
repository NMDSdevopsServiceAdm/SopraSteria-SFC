import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-file-error-message',
  templateUrl: './file-error-message.component.html',
  providers: [],
})
export class FileErrorMessageComponent {
  @Input() warning: number;
  @Input() error: number;
}
