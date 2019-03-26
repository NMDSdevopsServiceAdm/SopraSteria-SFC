import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OtherQualificationsLevelComponent } from './other-qualifications-level.component';

describe('OtherQualificationsLevelComponent', () => {
  let component: OtherQualificationsLevelComponent;
  let fixture: ComponentFixture<OtherQualificationsLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OtherQualificationsLevelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherQualificationsLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
