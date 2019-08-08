import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDownloadLinkComponent } from './report-download-link.component';

describe('ReportDownloadLinkComponent', () => {
  let component: ReportDownloadLinkComponent;
  let fixture: ComponentFixture<ReportDownloadLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportDownloadLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportDownloadLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
