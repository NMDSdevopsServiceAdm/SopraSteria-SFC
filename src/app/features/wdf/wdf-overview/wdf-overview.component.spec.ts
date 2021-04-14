import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WdfOverviewComponent } from './wdf-overview.component';

describe('WdfOverviewComponent', () => {
  let component: WdfOverviewComponent;
  let fixture: ComponentFixture<WdfOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WdfOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
