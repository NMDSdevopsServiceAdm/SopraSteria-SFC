import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUserAccountComponent } from './view-user-account.component';

describe('ViewUserAccountComponent', () => {
  let component: ViewUserAccountComponent;
  let fixture: ComponentFixture<ViewUserAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewUserAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewUserAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
