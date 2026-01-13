import { Component, DestroyRef, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ParentRequestsStateService } from '@core/services/admin/admin-parent-request-status/admin-parent-request-status.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { filter, map, take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CqcStatusChangeStateService } from '@core/services/admin/admin-cqc-main-service-status/admin-cqc-main-service-status.service';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { merge, of } from 'rxjs';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.scss'],
  standalone: false,
})
export class AdminMenuComponent implements OnInit {
  constructor(
    private router: Router,
    private parentRequestsState: ParentRequestsStateService,
    private parentRequestsService: ParentRequestsService,
    private cqcStatusChangeState: CqcStatusChangeStateService,
    private cqcStatusChangeService: CqcStatusChangeService,
    private destroyRef: DestroyRef,
  ) {}

  private readonly reload$ = merge(
    of(null), // initial load
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)),
  );

  readonly showParentFlag$ = this.parentRequestsState.get$().pipe(
    filter(Array.isArray),
    map((data) => data.some((r) => r.status?.toLowerCase() === 'pending')),
  );

  readonly showCqcFlag$ = this.cqcStatusChangeState.get$().pipe(
    filter(Array.isArray),
    map((data) => data.some((r) => r.status?.toLowerCase() === 'pending')),
  );

  ngOnInit(): void {
    this.reload$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.loadParentRequests();
      this.loadCqcChangeRequests();
    });
  }

  private loadParentRequests(): void {
    this.parentRequestsService
      .getParentRequests()
      .pipe(take(1))
      .subscribe((data) => this.parentRequestsState.set(data));
  }

  private loadCqcChangeRequests(): void {
    this.cqcStatusChangeService
      .getCqcStatusChanges()
      .pipe(take(1))
      .subscribe((data) => this.cqcStatusChangeState.set(data));
  }
}
