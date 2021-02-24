import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-staff-mismatch-banner',
  templateUrl: './staff-mismatch-banner.component.html',
})
export class StaffMismatchBannerComponent implements OnInit, OnChanges {
  @Input() workersCount:number;
  @Input() numberOfStaff:number;
  @Output() selectStaffTab: EventEmitter<Event> = new EventEmitter();
  @Output() selectTotalStaff: EventEmitter<Event> = new EventEmitter();

  public type: string;
  public difference: number;
  constructor() { }

  public ngOnChanges(changes: SimpleChanges) {
    if ('workersCount' in changes) {
      this.recalculate()
    }
    if ('numberOfStaff' in changes) {
      this.recalculate()
    }
  }

  ngOnInit(): void {
    this.recalculate();
  }

  public recalculate() {
    this.workersCount = !this.workersCount ? 0 : this.workersCount;
    if(!this.numberOfStaff && this.numberOfStaff !== 0){
      this.type= "noStaff";
      return;
    }else if (this.numberOfStaff < this.workersCount) {
      this.type = "moreStaffRecords";
      this.difference = this.workersCount  - this.numberOfStaff;
      return;
    }else if(this.numberOfStaff > this.workersCount){
      this.type = "moreStaff";
      this.difference = this.numberOfStaff  - this.workersCount;
      return;
    }
  }
  clickedSelectStaff($event) {
    this.selectStaffTab.emit($event);
  }
  clickedTotalStaff($event){
    this.selectTotalStaff.emit($event);
  }

}
