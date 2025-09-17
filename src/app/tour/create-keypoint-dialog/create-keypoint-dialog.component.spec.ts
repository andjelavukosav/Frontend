import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateKeypointDialogComponent } from './create-keypoint-dialog.component';

describe('CreateKeypointDialogComponent', () => {
  let component: CreateKeypointDialogComponent;
  let fixture: ComponentFixture<CreateKeypointDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateKeypointDialogComponent]
    });
    fixture = TestBed.createComponent(CreateKeypointDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
