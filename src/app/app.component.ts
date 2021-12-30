import { Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, FormControl } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import * as uuid from 'uuid';
import { PanZoom } from 'panzoom';

import { Socket } from './dialogue-node-socket/dialogue-node-socket.component';
import { DialogueNodeComponent } from './dialogue-node/dialogue-node';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  import: FormControl = new FormControl('');

  form: FormGroup = new FormGroup({
    name: new FormControl(''),
    key: new FormControl(''),
    start: new FormControl(''),
    dialogue: new FormArray([])
  });

  preview: string = '';
  zoomScale = 1;
  panzoomCanvas!: PanZoom;
  sockets: Socket[] = [];

  @ViewChild('canvas') canvasElement!: ElementRef;

  @ViewChildren(DialogueNodeComponent) dialogueNodes!: QueryList<DialogueNodeComponent>;

  constructor(
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.fromJSON('{"name":"Vegetarian","key":"vegetarian","start":"f7f814d0-91d2-4a41-a179-7478c96153b7","dialogue":[{"uid":"08ac47fb-c176-4a10-a875-6cd1583ccd7b","npc":"Are you a vegetarian?","type":"single","followUp":"","responses":[{"uid":"5e360956-7a7f-47ed-9b39-589f0bf72e4b","response":"Yes","followUp":"3cd2f0fc-e3e2-47f8-b704-a0c65fd511cf"},{"uid":"3d34c343-66a6-4620-9d89-0b996fb25438","response":"No","followUp":"8221ea46-03e1-4206-a3f6-4d399d4292bc"}],"editor":{"x":129,"y":145}},{"uid":"3cd2f0fc-e3e2-47f8-b704-a0c65fd511cf","npc":"What is your favorite vegetarian food?","type":"single","followUp":"","responses":[{"uid":"0a92a48b-0407-435a-9ef7-ce1fc0c54427","response":"Salad","followUp":"ca4509f5-019c-456f-a314-bac19573f87e"},{"uid":"553b0727-1f41-4a08-8a8a-e3e8f7404d9c","response":"Soup","followUp":"ca4509f5-019c-456f-a314-bac19573f87e"}],"editor":{"x":460,"y":45}},{"uid":"8221ea46-03e1-4206-a3f6-4d399d4292bc","npc":"What is your favorite food?","type":"single","followUp":"","responses":[{"uid":"61177e3f-b6a8-4e56-b869-1f9d3819ae1b","response":"Burger","followUp":"ca4509f5-019c-456f-a314-bac19573f87e"},{"uid":"5748ad93-e2f5-4ef3-a3d6-84b8772d61e6","response":"Steak","followUp":"ca4509f5-019c-456f-a314-bac19573f87e"},{"uid":"e5738c09-1ad0-4c9a-be4a-4c565428eaab","response":"Ribs","followUp":"ca4509f5-019c-456f-a314-bac19573f87e"}],"editor":{"x":397,"y":342}},{"uid":"ca4509f5-019c-456f-a314-bac19573f87e","npc":"Thank you!","type":"single","followUp":"","responses":[],"editor":{"x":721,"y":280}},{"uid":"f7f814d0-91d2-4a41-a179-7478c96153b7","npc":"What is your name?","type":"open","followUp":"3a0ae833-933b-458c-957f-40ab9aaab524","responses":[],"editor":{"x":-410,"y":163}},{"uid":"3a0ae833-933b-458c-957f-40ab9aaab524","npc":"Do you have any of the following food allergies?","type":"multi","followUp":"08ac47fb-c176-4a10-a875-6cd1583ccd7b","responses":[],"editor":{"x":-152,"y":160}}]}')

    this.form.get('start')?.valueChanges.subscribe(start => {
      this.preview = start;
    });

    this.form.get('name')?.valueChanges.subscribe(name => {
      if (name) {
        name = name.replace(/\s+/g, '-');
        this.form.controls['key'].setValue(name.toLowerCase());
      }
    });
  }

  onSetResponseFollowUp(event: any) {
    const item = this.getDialogue().at(this.getDialogue().value.map((p: any) => ({ ...p, index: this.getDialogue().value.indexOf(p) })).findIndex((x: any) => x.uid === event.item));
    if (event.item = event.response) {
      item.patchValue({'followUp': event.followUp});
    }
    else {
      const responses = item.get('responses') as FormArray;
      const response = responses!.at(responses.value.map((p: any) => ({ ...p, index: responses.value.indexOf(p) })).findIndex((x: any) => x.uid === event.response));
      response.patchValue({'followUp': event.followUp});
    }
  }

  onSetNodePosition(event: any) {
    const item = this.getDialogue().at(this.getDialogue().value.map((p: any) => ({ ...p, index: this.getDialogue().value.indexOf(p) })).findIndex((x: any) => x.uid === event.item));
    (item.get('editor') as FormGroup).patchValue({x: event.x, y: event.y});
  }

  onSelectedTabChange(event: MatTabChangeEvent) {
    if (event.index === 2) { }
  }

  getDialogUID(item: any) {
    return item.controls.uid.value;
  }

  getNPC(item: any) {
    return item.controls.npc.value;
  }

  getDialogue() {
    return this.form.get('dialogue') as FormArray;
  }

  createDialogue(): FormGroup {
    return this.formBuilder.group({
      uid: uuid.v4(),
      npc: '',
      type: 'single',
      followUp: '',
      responses: new FormArray([]),
      editor: this.formBuilder.group({
        x: 0,
        y: 0,
      })
    });
  }

  addDialogue(): void {
    this.getDialogue().push(this.createDialogue());
  }

  deleteDialogue(index: number): void {
    this.getDialogue().removeAt(index);
  }

  getDialogueItemById(id: string) {
    return this.getDialogue().value.map((p: any) => ({ ...p, index: this.getDialogue().value.indexOf(p) })).find((x: any) => x.uid === id);
  }

  setPreview(id: string) {
    this.preview = id;
  }

  toJSON() {
    let formObj = this.form.getRawValue();
    return JSON.stringify(formObj);
  }

  fromJSON(data: any) {
    try {
      data = JSON.parse(data);
    } catch (error) {
      alert("JSON could not be parsed: " + error);
      return;
    }

    this.form.reset();
    this.getDialogue().clear();
    this.preview = '';

    if (data.name) this.form.get('name')?.setValue(data.name);
    if (data.key) this.form.get('key')?.setValue(data.key);
    if (data.start) this.form.get('start')?.setValue(data.start);

    if (data.dialogue) {

      data.dialogue.forEach((dialogueItem: any) => {
        let dialogueItemFormGroup = this.formBuilder.group({
          uid: dialogueItem.uid ? dialogueItem.uid : uuid.v4(),
          npc: dialogueItem.npc ? dialogueItem.npc : '',
          type: dialogueItem.type ? dialogueItem.type : 'single',
          followUp: dialogueItem.followUp ? dialogueItem.followUp : '',
          responses: new FormArray([]),
          editor: this.formBuilder.group({
            x: 0,
            y: 0,
          })
        });

        if (dialogueItem.responses) {
          dialogueItem.responses.forEach((responseItem: any) => {
            (dialogueItemFormGroup.get('responses') as FormArray)?.push(this.formBuilder.group({
              uid: responseItem.uid ? responseItem.uid : uuid.v4(),
              response: responseItem.response ? responseItem.response : '',
              followUp: responseItem.followUp ? responseItem.followUp : '',
            }))
          })
        }

        if(dialogueItem.editor) {
          (dialogueItemFormGroup.get('editor') as FormGroup )?.patchValue({
            x: dialogueItem.editor.x ? dialogueItem.editor.x : 0,
            y: dialogueItem.editor.y ? dialogueItem.editor.y : 0,
          })
        }

        this.getDialogue().push(dialogueItemFormGroup);
      });

      this.import.reset();
    }
  }
}
