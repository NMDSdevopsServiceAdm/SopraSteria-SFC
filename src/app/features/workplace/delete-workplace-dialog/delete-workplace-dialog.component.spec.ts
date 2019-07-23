import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteWorkplaceDialogComponent } from './delete-workplace-dialog.component';

describe('DeleteWorkplaceDialogComponent', () => {
  let component: DeleteWorkplaceDialogComponent;
  let fixture: ComponentFixture<DeleteWorkplaceDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteWorkplaceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteWorkplaceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
