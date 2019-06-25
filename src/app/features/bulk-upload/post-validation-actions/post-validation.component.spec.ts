import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostValidationActionsComponent } from './post-validation-actions.component';

describe('PostValidationActionsComponent', () => {
  let component: PostValidationActionsComponent;
  let fixture: ComponentFixture<PostValidationActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PostValidationActionsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostValidationActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
