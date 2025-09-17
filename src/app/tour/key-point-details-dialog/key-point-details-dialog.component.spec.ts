import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyPointDetailsDialogComponent } from './key-point-details-dialog.component';

describe('KeyPointDetailsDialogComponent', () => {
  let component: KeyPointDetailsDialogComponent;
  let fixture: ComponentFixture<KeyPointDetailsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KeyPointDetailsDialogComponent]
    });
    fixture = TestBed.createComponent(KeyPointDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
