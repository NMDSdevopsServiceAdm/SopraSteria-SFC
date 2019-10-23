import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectRequestDialogComponent } from './reject-request-dialog.component';

describe('RejectRequestDialogComponent', () => {
  let component: RejectRequestDialogComponent;
  let fixture: ComponentFixture<RejectRequestDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectRequestDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
