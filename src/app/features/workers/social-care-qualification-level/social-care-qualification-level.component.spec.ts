import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SocialCareQualificationLevelComponent } from './social-care-qualification-level.component';

describe('SocialCareQualificationLevelComponent', () => {
  let component: SocialCareQualificationLevelComponent;
  let fixture: ComponentFixture<SocialCareQualificationLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SocialCareQualificationLevelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialCareQualificationLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
