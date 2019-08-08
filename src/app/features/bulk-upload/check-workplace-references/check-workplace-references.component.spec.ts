import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckWorkplaceReferencesComponent } from './check-workplace-references.component';

describe('CheckWorkplaceReferencesComponent', () => {
  let component: CheckWorkplaceReferencesComponent;
  let fixture: ComponentFixture<CheckWorkplaceReferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckWorkplaceReferencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckWorkplaceReferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
