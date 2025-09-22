import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishTourComponent } from './publish-tour.component';

describe('PublishTourComponent', () => {
  let component: PublishTourComponent;
  let fixture: ComponentFixture<PublishTourComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PublishTourComponent]
    });
    fixture = TestBed.createComponent(PublishTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
