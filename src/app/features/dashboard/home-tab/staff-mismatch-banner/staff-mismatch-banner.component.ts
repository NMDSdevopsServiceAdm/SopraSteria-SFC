import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-staff-mismatch-banner',
  templateUrl: './staff-mismatch-banner.component.html',
})
export class StaffMismatchBannerComponent implements OnInit, OnChanges {
  @Input() workersCount:number;
  @Input() numberOfStaff:number;
  @Output() selectStaffTab: EventEmitter<Event> = new EventEmitter();
  public type: string;
  public difference: number;
  constructor() { }

  public ngOnChanges(changes: SimpleChanges) {
    if ('workersCount' in changes) {
      this.recalculate()
    }
  }

  ngOnInit(): void {
    this.recalculate()
  }

  public recalculate(){
    if (this.numberOfStaff < this.workersCount) {
      this.type = "moreStaffRecords";
      this.difference = this.workersCount  - this.numberOfStaff

    }else if(this.numberOfStaff > this.workersCount){
      this.type = "moreStaff";
      this.difference = this.numberOfStaff  - this.workersCount
    }
  }
  clickedSelectStaff($event) {
    this.selectStaffTab.emit($event);
  }

}
