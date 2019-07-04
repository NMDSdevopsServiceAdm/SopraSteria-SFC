import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WdfUpdateWarningComponent } from './wdf-update-warning.component';

describe('WdfUpdateWarningComponent', () => {
  let component: WdfUpdateWarningComponent;
  let fixture: ComponentFixture<WdfUpdateWarningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WdfUpdateWarningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfUpdateWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
