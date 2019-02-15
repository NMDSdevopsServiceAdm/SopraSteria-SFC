import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceUnavailablePagesComponent } from './service-unavailable-pages.component';

describe('ServiceUnavailablePagesComponent', () => {
  let component: ServiceUnavailablePagesComponent;
  let fixture: ComponentFixture<ServiceUnavailablePagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceUnavailablePagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceUnavailablePagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
