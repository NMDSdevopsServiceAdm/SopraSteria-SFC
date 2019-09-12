import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeDataOwnerDialogComponent } from './change-data-owner-dialog.component';

describe('ChangeDataOwnerDialogComponent', () => {
  let component: ChangeDataOwnerDialogComponent;
  let fixture: ComponentFixture<ChangeDataOwnerDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeDataOwnerDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeDataOwnerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
