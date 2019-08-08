import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BritishCitizenshipComponent } from './british-citizenship.component';

describe('BritishCitizenshipComponent', () => {
  let component: BritishCitizenshipComponent;
  let fixture: ComponentFixture<BritishCitizenshipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BritishCitizenshipComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BritishCitizenshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
