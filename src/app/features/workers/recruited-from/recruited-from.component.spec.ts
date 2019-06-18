import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruitedFromComponent } from './recruited-from.component';

describe('RecruitedFromComponent', () => {
  let component: RecruitedFromComponent;
  let fixture: ComponentFixture<RecruitedFromComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecruitedFromComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecruitedFromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
