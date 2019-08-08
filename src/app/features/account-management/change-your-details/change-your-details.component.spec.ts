import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeYourDetailsComponent } from './change-your-details.component';

describe('ChangeYourDetailsComponent', () => {
  let component: ChangeYourDetailsComponent;
  let fixture: ComponentFixture<ChangeYourDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeYourDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeYourDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
