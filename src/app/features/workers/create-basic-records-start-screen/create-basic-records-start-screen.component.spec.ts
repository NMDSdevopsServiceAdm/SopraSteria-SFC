import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBasicRecordsStartScreenComponent } from './create-basic-records-start-screen.component';

describe('CreateBasicRecordsStartScreenComponent', () => {
  let component: CreateBasicRecordsStartScreenComponent;
  let fixture: ComponentFixture<CreateBasicRecordsStartScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateBasicRecordsStartScreenComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBasicRecordsStartScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
