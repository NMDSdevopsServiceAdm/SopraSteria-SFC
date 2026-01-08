import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ParentRequestsStateService } from '@core/services/admin/admin-parent-request-status/admin-parent-request-status.service';
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
    private router: Router,
    private parentRequestsState: ParentRequestsStateService,
    private parentRequestsService: ParentRequestsService,
  ) {}

  ngOnInit(): void {
    // Initial load
    this.loadParentRequests();

    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.loadParentRequests();
    });

    this.parentRequestsState
      .get$()
      .pipe(filter((data): data is any[] => Array.isArray(data)))
      .subscribe((data) => {
        this.showFlag = data.some((r) => r.status?.toLowerCase() === 'pending');
      });
  }

  private loadParentRequests(): void {
    this.parentRequestsService
      .getParentRequests()
      .pipe(take(1))
      .subscribe((data) => this.parentRequestsState.set(data));
  }
}
