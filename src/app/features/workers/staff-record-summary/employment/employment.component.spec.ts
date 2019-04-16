import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmploymentComponent } from './employment.component';

describe('EmploymentComponent', () => {
  let component: EmploymentComponent;
  let fixture: ComponentFixture<EmploymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmploymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmploymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
