import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OtherQualificationsComponent } from './other-qualifications.component';

describe('OtherQualificationsComponent', () => {
  let component: OtherQualificationsComponent;
  let fixture: ComponentFixture<OtherQualificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OtherQualificationsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherQualificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
