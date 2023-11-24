import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissingReferencesToggleComponent } from './missing-references-toggle.component';

describe('MissingReferencesToggleComponent', () => {
  let component: MissingReferencesToggleComponent;
  let fixture: ComponentFixture<MissingReferencesToggleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MissingReferencesToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MissingReferencesToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
