import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareLocalAuthorityComponent } from './share-local-authority.component';

describe('StaffComponent', () => {
  let component: ShareLocalAuthorityComponent;
  let fixture: ComponentFixture<ShareLocalAuthorityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShareLocalAuthorityComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareLocalAuthorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
