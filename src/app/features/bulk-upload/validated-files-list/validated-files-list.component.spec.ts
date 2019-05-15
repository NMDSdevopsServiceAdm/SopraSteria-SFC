import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidatedFilesListComponent } from './validated-files-list.component';

describe('ValidatedFilesListComponent', () => {
  let component: ValidatedFilesListComponent;
  let fixture: ComponentFixture<ValidatedFilesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidatedFilesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidatedFilesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
