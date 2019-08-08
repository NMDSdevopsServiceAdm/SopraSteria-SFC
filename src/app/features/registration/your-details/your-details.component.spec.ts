import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YourDetailsComponent } from './your-details.component';

describe('YourDetailsComponent', () => {
  let component: YourDetailsComponent;
  let fixture: ComponentFixture<YourDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [YourDetailsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YourDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
