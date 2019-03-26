import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageNotFoundPagesComponent } from './page-not-found-pages.component';

describe('PageNotFoundPagesComponent', () => {
  let component: PageNotFoundPagesComponent;
  let fixture: ComponentFixture<PageNotFoundPagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageNotFoundPagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageNotFoundPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
