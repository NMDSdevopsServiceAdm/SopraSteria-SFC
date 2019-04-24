import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-total-staff-panel',
  templateUrl: './total-staff-panel.component.html',
  styleUrls: ['./total-staff-panel.component.scss'],
})
export class TotalStaffPanelComponent implements OnInit {
  @Input() totalStaff = 0;
  @Input() totalWorkers = 0;

  constructor() {}

  ngOnInit() {
    // const combined$ = combineLatest(this.establishmentService.getStaff(), this.workerService.getAllWorkers());
    // this.subscriptions.add(
    //   combined$.pipe(map(results => ({ staff: results[0], workers: results[1].length }))).subscribe(total => {
    //     this.total = total;
    //   })
    // );
  }
}
