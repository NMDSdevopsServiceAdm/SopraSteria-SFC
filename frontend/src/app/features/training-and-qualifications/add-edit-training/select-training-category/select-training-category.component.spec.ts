import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTrainingCategoryComponent } from './select-training-category.component';

describe('SelectTrainingCategoryComponent', () => {
  let component: SelectTrainingCategoryComponent;
  let fixture: ComponentFixture<SelectTrainingCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectTrainingCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectTrainingCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
