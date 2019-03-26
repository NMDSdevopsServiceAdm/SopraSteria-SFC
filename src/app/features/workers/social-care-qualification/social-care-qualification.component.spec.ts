import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SocialCareQualificationComponent } from './social-care-qualification.component';

describe('SocialCareQualificationComponent', () => {
  let component: SocialCareQualificationComponent;
  let fixture: ComponentFixture<SocialCareQualificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SocialCareQualificationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialCareQualificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
