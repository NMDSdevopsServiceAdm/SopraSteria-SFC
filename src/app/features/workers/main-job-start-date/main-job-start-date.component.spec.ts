import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainJobStartDateComponent } from './main-job-start-date.component';

describe('MainJobStartDateComponent', () => {
  let component: MainJobStartDateComponent;
  let fixture: ComponentFixture<MainJobStartDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MainJobStartDateComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainJobStartDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
