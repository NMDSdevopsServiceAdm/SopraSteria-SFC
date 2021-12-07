import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cqc-main-service-change-list',
  templateUrl: './cqc-main-service-change-list.component.html',
})
export class CQCMainServiceChangeListComponent implements OnInit {
  public pendingCQCMainServiceChanges: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.pendingCQCMainServiceChanges = this.route.snapshot.data.cqcStatusChangeList;
  }
}
