import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-parent-requests-list',
  templateUrl: './parent-requests-list.component.html',
})
export class ParentRequestsListComponent implements OnInit {
  public parentRequests = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.parentRequests = this.route.snapshot.data.parentRequests;
  }
}
