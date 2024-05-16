import { TestBed } from '@angular/core/testing';

import { PreviousRouteService } from './previous-route.service';

describe('PreviousRouteService', () => {
  let service: PreviousRouteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreviousRouteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the lastSelectedTab if the previousUrl includes `dashboard`', () => {
    const lastSelectedTab = 'workplace';
    service.previousUrl = '/dashboard#workplace';
    service.setLastSelectedTab(lastSelectedTab);
    expect(service.getPreviousPage()).toEqual('workplace');
  });

  it('should return the previousUrl if the previousUrl doesn`t include `dashboard`', () => {
    const lastSelectedTab = 'staff-records';
    service.previousUrl = '/workplace';
    service.setLastSelectedTab(lastSelectedTab);
    expect(service.getPreviousPage()).toEqual('workplace');
  });

  it('should return the second part of the url if there is a slash in between', () => {
    service.previousUrl = '/workplace/view-all-workplaces';
    expect(service.getPreviousPage()).toEqual('view-all-workplaces');
  });

  it('should return null when an empty string is set as previous page', () => {
    const lastSelectedTab = '';
    service.setLastSelectedTab(lastSelectedTab);
    expect(service.getPreviousPage()).toEqual(null);
  });

  it('should return null if there is not a previous page', () => {
    const lastSelectedTab = null;
    service.setLastSelectedTab(lastSelectedTab);
    expect(service.getPreviousPage()).toEqual(lastSelectedTab);
  });
});
