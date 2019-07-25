import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWorkplaceComponent } from './add-workplace.component';

describe('AddWorkplaceComponent', () => {
  let component: AddWorkplaceComponent;
  let fixture: ComponentFixture<AddWorkplaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddWorkplaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddWorkplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
