import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogueNodeSocketComponent } from './dialogue-node-socket.component';

describe('DialogueNodeSocketComponent', () => {
  let component: DialogueNodeSocketComponent;
  let fixture: ComponentFixture<DialogueNodeSocketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogueNodeSocketComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogueNodeSocketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
