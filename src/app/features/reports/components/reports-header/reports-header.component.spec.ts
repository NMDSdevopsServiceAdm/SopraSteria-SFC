import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsHeaderComponent } from './reports-header.component';

describe('ReportsHeaderComponent', () => {
  let component: ReportsHeaderComponent;
  let fixture: ComponentFixture<ReportsHeaderComponent>;

  beforeEach(async(() => {
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
