import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WdfReportComponent } from './wdf-report.component';

describe('WdfReportComponent', () => {
  let component: WdfReportComponent;
  let fixture: ComponentFixture<WdfReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WdfReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
