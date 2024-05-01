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

  it('should set the previous url', () => {
    const previousUrl = '/workplace';
    service.setPreviousTab(previousUrl);
    expect(service.getPreviousUrl()).toEqual(previousUrl);
  });

  it('should return the previous page if there is one', () => {
    const previousUrl = '/dashboard#workplace';
    service.setPreviousTab(previousUrl);
    expect(service.getPreviousPage()).toEqual('workplace');
  });

  it('should return an empty string when an empty string is set as previous page', () => {
    const previousUrl = '';
    service.setPreviousTab(previousUrl);
    expect(service.getPreviousPage()).toEqual('');
  });

  it('should return null if there is not a previous page', () => {
    const previousUrl = null;
    service.setPreviousTab(previousUrl);
    expect(service.getPreviousPage()).toEqual(null);
  });
});
