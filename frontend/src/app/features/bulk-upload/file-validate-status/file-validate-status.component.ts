import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-file-validate-status',
    templateUrl: './file-validate-status.component.html',
    styleUrls: ['./file-validate-status.component.scss'],
    preserveWhitespaces: true,
    standalone: false
})
export class FileValidateStatusComponent {
  @Input() public warnings: number;
  @Input() public errors: number;
}
