import { Component, OnInit } from '@angular/core';
import { ParentRequestsService } from '@core/services/parent-requests.service';

@Component({
  selector: 'app-parent-requests',
  templateUrl: './parent-requests.component.html'
})
export class ParentRequestsComponent implements OnInit {
  public parentRequests = [];

  constructor(
    public parentRequestsService: ParentRequestsService,
  ) {}

  ngOnInit() {
    this.getParentRequests();
  }

  public getParentRequests() {
    this.parentRequestsService.getParentRequests().subscribe(
      data => {
        this.parentRequests = data;
      },
      error => this.onError(error)
    );
  }

  public handleParentRequest(index: number) {
    this.parentRequests.splice(index, 1);
  }

  private onError(error) {}
}
