import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ControlContainer, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import * as uuid from 'uuid'; 

@Component({
  selector: 'app-dialogue-item',
  templateUrl: './dialogue-item.component.html',
  styleUrls: ['./dialogue-item.component.scss']
})
export class DialogueItemComponent implements OnInit {
  public form: FormGroup = new FormGroup({});

  @Input() dialogue: any;

  @Output() delete: EventEmitter<any> = new EventEmitter();

  constructor(private formBuilder: FormBuilder, private controlContainer: ControlContainer) { }

  ngOnInit() {
    this.form = <FormGroup>this.controlContainer.control;
  }

  getNPC(item: any) {
    console.log(item);
    return item.controls.npc.value;
  }

  getResponses() {
    return this.form.get('responses') as FormArray;
  }

  createResponse(): FormGroup {
    return this.formBuilder.group({
      uid: uuid.v4(),
      response: '',
      followUp: '',
    });
  }

  addResponse(index: number): void {
    this.getResponses().insert(index + 1, this.createResponse());
  }

  deleteResponse(index: number): void {
    this.getResponses().removeAt(index);
  }
}
