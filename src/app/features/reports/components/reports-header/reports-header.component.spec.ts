import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReportsHeaderComponent } from './reports-header.component';

describe('ReportsHeaderComponent', () => {
  let component: ReportsHeaderComponent;
  let fixture: ComponentFixture<ReportsHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportsHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
