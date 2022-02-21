import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
})
export class SubmitButtonComponent implements OnInit {
  @Input() return: boolean;
  @Input() saveCallback: any;
  @Input() callToAction = 'Save and continue';
  @Input() recordSummary = true;
  @Input() canExit = true;
  @Input() exitText = 'Exit';
  @Output() clicked = new EventEmitter<{ action: string; save: boolean }>();

  public isExistingStaffRecord = false;

  constructor(private workerService: WorkerService) {}

  ngOnInit(): void {
    this.isExistingStaffRecord = Boolean(this.workerService.worker);
  }

  onClick(event: Event, action: string, save: boolean): void {
    event.preventDefault();
    this.clicked.emit({ action, save });
  }
}
