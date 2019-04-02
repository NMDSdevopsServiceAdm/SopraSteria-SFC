import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesCapacityComponent } from './services-capacity.component';

describe('ServicesCapacityComponent', () => {
  let component: ServicesCapacityComponent;
  let fixture: ComponentFixture<ServicesCapacityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServicesCapacityComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicesCapacityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
