import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CareCertificateComponent } from './care-certificate.component';

describe('CareCertificate', () => {
  let component: CareCertificateComponent;
  let fixture: ComponentFixture<CareCertificateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CareCertificateComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CareCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
