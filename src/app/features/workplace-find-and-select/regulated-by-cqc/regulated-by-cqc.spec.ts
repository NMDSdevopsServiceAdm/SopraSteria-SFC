import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RegulatedByCQC } from './regulated-by-cqc';

describe('RegulatedByCQC', () => {
  let component: RegulatedByCQC;
  let fixture: ComponentFixture<RegulatedByCQC>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegulatedByCQC],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegulatedByCQC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
