import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePostcodeComponent } from './home-postcode.component';

describe('HomePostcodeComponent', () => {
  let component: HomePostcodeComponent;
  let fixture: ComponentFixture<HomePostcodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HomePostcodeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePostcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
