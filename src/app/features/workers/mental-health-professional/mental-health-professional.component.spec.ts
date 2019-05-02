import { async, ComponentFixture, TestBed } from '@angular/core/testing';

describe('MentalHealthProfessionalComponent', () => {
  let component: MentalHealthProfessionalComponent;
  let fixture: ComponentFixture<MentalHealthProfessionalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MentalHealthProfessionalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MentalHealthProfessionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
