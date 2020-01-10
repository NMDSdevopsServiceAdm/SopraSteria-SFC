import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RegulatedByCqcComponent } from './regulated-by-cqc.component';

describe('RegulatedByCqcComponent', () => {
  let component: RegulatedByCqcComponent;
  let fixture: ComponentFixture<RegulatedByCqcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegulatedByCqcComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegulatedByCqcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
