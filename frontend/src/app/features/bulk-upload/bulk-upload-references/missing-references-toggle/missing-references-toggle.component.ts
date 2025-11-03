import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-missing-references-toggle',
    templateUrl: './missing-references-toggle.component.html',
    standalone: false
})
export class MissingReferencesToggleComponent {
  @Input() showMissing: boolean;
  @Output() showMissingChange = new EventEmitter<boolean>();

  public toggleShowAll() {
    this.showMissing = !this.showMissing;
    this.showMissingChange.emit(this.showMissing);
  }
}
