import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBasicRecordsComponent } from './create-basic-records.component';

describe('CreateBasicRecordsComponent', () => {
  let component: CreateBasicRecordsComponent;
  let fixture: ComponentFixture<CreateBasicRecordsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateBasicRecordsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBasicRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
