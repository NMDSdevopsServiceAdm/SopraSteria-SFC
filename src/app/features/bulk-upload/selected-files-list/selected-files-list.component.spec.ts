import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedFilesListComponent } from './selected-files-list.component';

describe('SelectedFilesListComponent', () => {
  let component: SelectedFilesListComponent;
  let fixture: ComponentFixture<SelectedFilesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedFilesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedFilesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
