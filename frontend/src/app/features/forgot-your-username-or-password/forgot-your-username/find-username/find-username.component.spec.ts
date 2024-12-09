import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindUsernameComponent } from './find-username.component';

describe('FindUsernameComponent', () => {
  let component: FindUsernameComponent;
  let fixture: ComponentFixture<FindUsernameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FindUsernameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindUsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
