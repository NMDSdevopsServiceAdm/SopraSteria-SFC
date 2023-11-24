import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ServiceUnavailableComponent } from './service-unavailable.component';

describe('ServiceUnavailableComponent', () => {
  let component: ServiceUnavailableComponent;
  let fixture: ComponentFixture<ServiceUnavailableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceUnavailableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceUnavailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
