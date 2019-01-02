import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareOptionsComponent } from './shareOptions.component';

describe('StaffComponent', () => {
  let component: ShareOptionsComponent;
  let fixture: ComponentFixture<ShareOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
