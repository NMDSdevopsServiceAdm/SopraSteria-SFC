import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceUsersComponent } from './service-users.component';

describe('ServiceUsersComponent', () => {
  let component: ServiceUsersComponent;
  let fixture: ComponentFixture<ServiceUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceUsersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
