import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeTabComponent } from './home-tab.component';

describe('HomeTabComponent', () => {
  let component: HomeTabComponent;
  let fixture: ComponentFixture<HomeTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
