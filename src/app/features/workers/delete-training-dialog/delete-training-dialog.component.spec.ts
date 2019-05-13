import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteTrainingDialogComponent } from './delete-training-dialog.component';

describe('DeleteTrainingDialogComponent', () => {
  let component: DeleteTrainingDialogComponent;
  let fixture: ComponentFixture<DeleteTrainingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteTrainingDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteTrainingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
