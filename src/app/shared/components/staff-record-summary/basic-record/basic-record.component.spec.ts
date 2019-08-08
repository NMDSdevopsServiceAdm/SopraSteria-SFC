import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicRecordComponent } from './basic-record.component';

describe('BasicRecordComponent', () => {
  let component: BasicRecordComponent;
  let fixture: ComponentFixture<BasicRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BasicRecordComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
