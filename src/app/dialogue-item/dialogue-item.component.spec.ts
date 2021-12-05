import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogueItemComponent } from './dialogue-item.component';

describe('DialogueItemComponent', () => {
  let component: DialogueItemComponent;
  let fixture: ComponentFixture<DialogueItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogueItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogueItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
