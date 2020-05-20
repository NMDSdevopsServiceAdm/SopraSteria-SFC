import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentRequestsComponent } from './parent-requests.component';

describe('ParentRequestsComponent', () => {
  let component: ParentRequestsComponent;
  let fixture: ComponentFixture<ParentRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParentRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
