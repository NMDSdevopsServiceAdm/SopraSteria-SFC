import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingSpecialismComponent } from './nursing-specialism.component';

describe('NursingSpecialismComponent', () => {
  let component: NursingSpecialismComponent;
  let fixture: ComponentFixture<NursingSpecialismComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NursingSpecialismComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NursingSpecialismComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
