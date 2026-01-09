import { provideRouter } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AdminMenuComponent } from './admin-menu.component';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { ParentRequestsStateService } from '@core/services/admin/admin-parent-request-status/admin-parent-request-status.service';
import { provideHttpClient } from '@angular/common/http';

describe('AdminMenuComponent', () => {
  async function setup(mockData: any[] = []) {
    const setupTools = await render(AdminMenuComponent, {
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    const component = setupTools.fixture.componentInstance;

    const parentRequestsService = TestBed.inject(ParentRequestsService);
    const parentRequestsState = TestBed.inject(ParentRequestsStateService);

    spyOn(parentRequestsService, 'getParentRequests').and.returnValue(of(mockData));

    return {
      ...setupTools,
      component,
      parentRequestsService,
      parentRequestsState,
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

  it('should call getParentRequests on init', async () => {
    const { fixture, parentRequestsService } = await setup([]);

    fixture.componentInstance.ngOnInit();

    expect(parentRequestsService.getParentRequests).toHaveBeenCalledTimes(1);
  });

  it('should set showFlag = true when a Pending request exists', async () => {
    const { fixture, component, parentRequestsState } = await setup([]);

    fixture.detectChanges();

    parentRequestsState.set([{ status: 'InProgress' }, { status: 'Pending' }]);

    expect(component.showFlag).toBeTrue();
  });

  it('should set showFlag = false when no Pending request exists', async () => {
    const { fixture, component, parentRequestsState } = await setup([]);

    fixture.detectChanges();

    parentRequestsState.set([{ status: 'InProgress' }]);

    expect(component.showFlag).toBeFalse();
  });
});
