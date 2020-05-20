import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentRequestComponent } from './parent-request.component';

describe('ParentRequestComponent', () => {
  let component: ParentRequestComponent;
  let fixture: ComponentFixture<ParentRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParentRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
