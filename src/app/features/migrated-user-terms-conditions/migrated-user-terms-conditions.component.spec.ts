import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MigratedUserTermsConditionsComponent } from './migrated-user-terms-conditions.component';

describe('MigratedUserTermsConditionsComponent', () => {
  let component: MigratedUserTermsConditionsComponent;
  let fixture: ComponentFixture<MigratedUserTermsConditionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MigratedUserTermsConditionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MigratedUserTermsConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
