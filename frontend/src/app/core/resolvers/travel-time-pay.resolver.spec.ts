import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { TravelTimePayService } from '@core/services/travel-time-pay.service';
import { TravelTimePayResolver } from './travel-time-pay.resolver';

fdescribe('getAllTravelTimePayOptionsResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [],
      providers: [TravelTimePayService, TravelTimePayResolver, provideHttpClient(), provideHttpClientTesting()],
    });

    const resolver = TestBed.inject(TravelTimePayResolver);
    const travelTimePayService = TestBed.inject(TravelTimePayService);

    const getAllTravelTimePayOptionsSpy = spyOn(travelTimePayService, 'getAllTravelTimePayOptions').and.returnValue(
      of(null),
    );

    return {
      resolver,
      travelTimePayService,
      getAllTravelTimePayOptionsSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getAllTravelTimePayOptions', () => {
    const { resolver, getAllTravelTimePayOptionsSpy } = setup();

    resolver.resolve();

    expect(getAllTravelTimePayOptionsSpy).toHaveBeenCalled();
  });
});
