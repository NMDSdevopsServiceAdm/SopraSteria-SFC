import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteQualificationDialogComponent } from './delete-qualification-dialog.component';

describe('DeleteQualificationDialogComponent', () => {
  let component: DeleteQualificationDialogComponent;
  let fixture: ComponentFixture<DeleteQualificationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteQualificationDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteQualificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
