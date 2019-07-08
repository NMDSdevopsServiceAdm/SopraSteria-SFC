import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WdfComponent } from '@features/reports/pages/wdf/wdf.component';

describe('WdfReportComponent', () => {
  let component: WdfComponent;
  let fixture: ComponentFixture<WdfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WdfComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
