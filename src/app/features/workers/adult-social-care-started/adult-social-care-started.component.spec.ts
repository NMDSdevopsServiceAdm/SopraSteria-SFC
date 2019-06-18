import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdultSocialCareStartedComponent } from './adult-social-care-started.component';

describe('AdultSocialCareStartedComponent', () => {
  let component: AdultSocialCareStartedComponent;
  let fixture: ComponentFixture<AdultSocialCareStartedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdultSocialCareStartedComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdultSocialCareStartedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
