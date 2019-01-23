import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EthnicityComponent } from './ethnicity.component';

describe('EthnicityComponent', () => {
  let component: EthnicityComponent;
  let fixture: ComponentFixture<EthnicityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EthnicityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EthnicityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
