import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewStartersComponent } from './add-new-starters.component';

describe('AddNewStartersComponent', () => {
  let component: AddNewStartersComponent;
  let fixture: ComponentFixture<AddNewStartersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewStartersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewStartersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
