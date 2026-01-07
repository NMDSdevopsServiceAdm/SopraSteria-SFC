import { Component, OnInit } from '@angular/core';
import { ParentRequestsStateService } from '@core/services/admin/admin-users/admin-users.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.scss'],
  standalone: false,
})
export class AdminMenuComponent implements OnInit {
  public showFlag: any;

  constructor(
    private parentRequestsState: ParentRequestsStateService,
    private parentRequestsService: ParentRequestsService,
  ) {}

  ngOnInit(): void {
    // Preload if not in cache
    if (!this.parentRequestsState.getSnapshot()) {
      this.parentRequestsService
        .getParentRequests()
        .pipe(take(1))
        .subscribe((data) => this.parentRequestsState.set(data));
    }

    // Subscribe safely to avoid null errors
    this.parentRequestsState
      .get$()
      .pipe(
        filter((data): data is any[] => data !== null), // ignore nulls
      )
      .subscribe((data) => {
        // dynamic check: show flag if ANY request has status 'Pending'
        this.showFlag = data.some((request) => request.status === 'Pending');
      });
  }
}
