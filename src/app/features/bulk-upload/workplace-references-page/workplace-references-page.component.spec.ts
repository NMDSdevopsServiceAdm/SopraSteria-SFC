import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceReferencesPageComponent } from './workplace-references-page.component';

describe('WorkplaceReferencesPageComponent', () => {
  let component: WorkplaceReferencesPageComponent;
  let fixture: ComponentFixture<WorkplaceReferencesPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkplaceReferencesPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceReferencesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
