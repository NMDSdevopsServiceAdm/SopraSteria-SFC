import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-bulk-upload-sanitise-data-checkbox',
  templateUrl: './bulk-upload-sanitise-data-checkbox.component.html',
})
export class BulkUploadSanitiseDataCheckboxComponent {
  @Output() public checkboxToggled: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() public sanitise: boolean;

  public toggleCheckbox(target: HTMLInputElement): void {
    const { checked } = target;
    this.checkboxToggled.emit(!checked);
  }
}
