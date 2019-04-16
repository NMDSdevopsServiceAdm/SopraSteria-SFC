import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditQualificationComponent } from './add-edit-qualification.component';

describe('AddEditQualificationComponent', () => {
  let component: AddEditQualificationComponent;
  let fixture: ComponentFixture<AddEditQualificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditQualificationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditQualificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
