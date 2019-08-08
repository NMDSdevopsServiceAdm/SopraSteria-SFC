import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicRecordsSaveSuccessComponent } from './basic-records-save-success.component';

describe('BasicRecordsSaveSuccessComponent', () => {
  let component: BasicRecordsSaveSuccessComponent;
  let fixture: ComponentFixture<BasicRecordsSaveSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BasicRecordsSaveSuccessComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicRecordsSaveSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
