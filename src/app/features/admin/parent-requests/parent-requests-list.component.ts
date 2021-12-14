import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-parent-requests-list',
  templateUrl: './parent-requests-list.component.html',
})
export class ParentRequestsListComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {}

  // public setStatusClass(status: string): string {
  //   return status === 'Pending' ? 'govuk-tag--grey' : 'govuk-tag--blue';
  // }
}
