import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YourAccountComponent } from './your-account.component';

describe('YourAccountComponent', () => {
  let component: YourAccountComponent;
  let fixture: ComponentFixture<YourAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YourAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YourAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
