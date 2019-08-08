import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferencesCreatedPageComponent } from './references-created-page.component';

describe('ReferencesCreatedPageComponent', () => {
  let component: ReferencesCreatedPageComponent;
  let fixture: ComponentFixture<ReferencesCreatedPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReferencesCreatedPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferencesCreatedPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
