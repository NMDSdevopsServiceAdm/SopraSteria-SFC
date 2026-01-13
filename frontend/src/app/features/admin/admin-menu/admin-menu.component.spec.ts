import { render } from '@testing-library/angular';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AdminMenuComponent } from './admin-menu.component';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { ParentRequestsStateService } from '@core/services/admin/admin-parent-request-status/admin-parent-request-status.service';
import { provideHttpClient } from '@angular/common/http';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { CqcStatusChangeStateService } from '@core/services/admin/admin-cqc-main-service-status/admin-cqc-main-service-status.service';

describe('AdminMenuComponent', () => {
  async function setup(parentData = [], cqcData = []) {
    const setupTools = await render(AdminMenuComponent, {
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    const component = setupTools.fixture.componentInstance;

    const parentRequestsService = TestBed.inject(ParentRequestsService);
    const parentRequestsState = TestBed.inject(ParentRequestsStateService);

    const cqcStatusChangeService = TestBed.inject(CqcStatusChangeService);
    const cqcStatusChangeState = TestBed.inject(CqcStatusChangeStateService);

    spyOn(parentRequestsService, 'getParentRequests').and.returnValue(of(parentData));
    spyOn(cqcStatusChangeService, 'getCqcStatusChanges').and.returnValue(of(cqcData));

    return {
      ...setupTools,
      component,
      parentRequestsService,
      parentRequestsState,
      cqcStatusChangeService,
      cqcStatusChangeState,
    };
  }

  it('should render AdminMenuComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should contain a local authority return link', async () => {
    const { getByText } = await setup();

    const link = getByText('Local authority returns');
    expect(link.getAttribute('href')).toBe('/sfcadmin/local-authorities-return');
  });

  it('should contain a CQC main service change link', async () => {
    const { getByText } = await setup();

    const link = getByText('CQC main service change');
    expect(link.getAttribute('href')).toBe('/sfcadmin/cqc-main-service-change');
  });

  it('should call services on init', async () => {
    const { component, parentRequestsService, cqcStatusChangeService } = await setup();

    component.ngOnInit();

    expect(parentRequestsService.getParentRequests).toHaveBeenCalled();
    expect(cqcStatusChangeService.getCqcStatusChanges).toHaveBeenCalled();
  });

  it('should set showParentFlag$ = true when a Pending request exists', async () => {
    const { component, parentRequestsState } = await setup();
    parentRequestsState.set([{ status: 'Pending' }]);

    component.showParentFlag$.subscribe((value) => {
      expect(value).toBeTrue();
    });
  });

  it('should set showParentFlag$ = false when no Pending request exists', async () => {
    const { component, parentRequestsState } = await setup();
    parentRequestsState.set([{ status: 'In Progress' }]);

    component.showParentFlag$.subscribe((value) => {
      expect(value).toBeFalse();
    });
  });

  it('should set showCqcFlag$ = false when no Pending request exists', async () => {
    const { component, cqcStatusChangeState } = await setup();
    cqcStatusChangeState.set([{ status: 'In Progress' }]);

    component.showCqcFlag$.subscribe((value) => {
      expect(value).toBeFalse();
    });
  });

  it('should set showCqcFlag$ = true when  Pending request exists', async () => {
    const { component, cqcStatusChangeState } = await setup();
    cqcStatusChangeState.set([{ status: 'Pending' }]);

    component.showCqcFlag$.subscribe((value) => {
      expect(value).toBeTrue();
    });
  });
});
