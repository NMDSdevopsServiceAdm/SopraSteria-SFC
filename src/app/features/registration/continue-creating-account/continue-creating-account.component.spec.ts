import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContinueCreatingAccountComponent } from './continue-creating-account.component';

describe('ContinueCreatingAccountComponent', () => {
  let component: ContinueCreatingAccountComponent;
  let fixture: ComponentFixture<ContinueCreatingAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContinueCreatingAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContinueCreatingAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
