import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryOfBirthComponent } from './country-of-birth.component';

describe('CountryOfBirthComponent', () => {
  let component: CountryOfBirthComponent;
  let fixture: ComponentFixture<CountryOfBirthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CountryOfBirthComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryOfBirthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
