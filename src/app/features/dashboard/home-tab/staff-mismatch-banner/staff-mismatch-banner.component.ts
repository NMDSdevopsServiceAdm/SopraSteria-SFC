import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-staff-mismatch-banner',
  templateUrl: './staff-mismatch-banner.component.html',
})
export class StaffMismatchBannerComponent implements OnChanges {
  @Input() workerCount: number;
  @Input() numberOfStaff: number;
  @Output() selectStaffTab: EventEmitter<Event> = new EventEmitter();
  @Output() selectTotalStaff: EventEmitter<Event> = new EventEmitter();

  public type: string;
  public difference: number;
  constructor() {}

  public ngOnChanges(changes: SimpleChanges): void {
    if ('workerCount' in changes) {
      this.recalculate();
    }
    if ('numberOfStaff' in changes) {
      this.recalculate();
    }
  }

  public recalculate(): void {
    this.workerCount = !this.workerCount ? 0 : this.workerCount;
    if (!this.numberOfStaff && this.numberOfStaff !== 0) {
      this.type = 'noStaff';
      return;
    }
    if (this.numberOfStaff === 0 && this.workerCount > 0) {
      this.type = 'moreStaffZeroRecords';
      return;
    }
    if (this.numberOfStaff < this.workerCount) {
      this.type = 'moreStaffRecords';
      this.difference = this.workerCount - this.numberOfStaff;
      return;
    }
    if (this.numberOfStaff > this.workerCount) {
      this.type = 'moreStaff';
      this.difference = this.numberOfStaff - this.workerCount;
      return;
    }
  }
  clickedSelectStaff($event): void {
    this.selectStaffTab.emit($event);
  }
  clickedTotalStaff($event): void {
    this.selectTotalStaff.emit($event);
  }
}
