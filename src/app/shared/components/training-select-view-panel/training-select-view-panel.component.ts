import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-training-select-view-panel',
  templateUrl: './training-select-view-panel.component.html',
  styleUrls: ['./training-select-view-panel.component.scss'],
})
export class TrainingSelectViewPanelComponent {
  @Input() viewTrainingByCategory: boolean;
  @Output() handleViewToggle: EventEmitter<boolean> = new EventEmitter();

  public handleViewChange(event: Event): void {
    event.preventDefault();
    this.handleViewToggle.emit(!this.viewTrainingByCategory);
  }
}
