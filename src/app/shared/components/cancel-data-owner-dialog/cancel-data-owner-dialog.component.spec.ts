import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelDataOwnerDialogComponent } from './cancel-data-owner-dialog.component';

describe('CancelDataOwnerDialogComponent', () => {
  let component: CancelDataOwnerDialogComponent;
  let fixture: ComponentFixture<CancelDataOwnerDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CancelDataOwnerDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelDataOwnerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
