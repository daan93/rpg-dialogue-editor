import { Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, FormControl } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
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
    dialogue: new FormArray([]),
    editor: this.formBuilder.group({
      viewPos: this.formBuilder.group({
        scale: 1,
        x: 0,
        y: 0,
      }),
      startPos: this.formBuilder.group({
        x: 0,
        y: 0,
      })
    })
  });

  previewInput = new FormControl('');

  activeDialogue = '';
  zoomScale = 1;
  panzoomCanvas!: PanZoom;
  sockets: Socket[] = [];

  @ViewChild('canvas') canvasElement!: ElementRef;

  @ViewChildren(DialogueNodeComponent) dialogueNodes!: QueryList<DialogueNodeComponent>;
  @ViewChildren('dialogueItem') dialogueItems!: QueryList<MatExpansionPanel>;

  constructor(
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.form.get('start')?.valueChanges.subscribe(start => {
      this.activeDialogue = start;
    });

    this.form.get('name')?.valueChanges.subscribe(name => {
      if (name) {
        name = name.replace(/\s+/g, '-');
        this.form.controls['key'].setValue(name.toLowerCase());
      }
    });
  }

  onSetResponseFollowUp(event: any) {
    if (event.item === 'start') {
      this.form.get('start')?.setValue(event.followUp);
    }
    else {
      const item = this.getDialogue().at(this.getDialogue().value.map((p: any) => ({ ...p, index: this.getDialogue().value.indexOf(p) })).findIndex((x: any) => x.uid === event.item));
      if (event.item === event.response) {
        item.patchValue({ 'followUp': event.followUp });
      }
      else {
        const responses = item.get('responses') as FormArray;
        const response = responses!.at(responses.value.map((p: any) => ({ ...p, index: responses.value.indexOf(p) })).findIndex((x: any) => x.uid === event.response));
        response.patchValue({ 'followUp': event.followUp });
      }
    }
  }

  onSetNodePosition(event: any) {
    if (event.item === 'start') {
      this.form.get('editor')?.get('startPos')?.patchValue({ x: event.x, y: event.y });
    }
    else {
      const item = this.getDialogue().at(this.getDialogue().value.map((p: any) => ({ ...p, index: this.getDialogue().value.indexOf(p) })).findIndex((x: any) => x.uid === event.item));
      (item.get('editor') as FormGroup).patchValue({ x: event.x, y: event.y });
    }
  }

  onSetViewPosition(event: any) {
     this.form.get('editor')?.get('viewPos')?.patchValue(event);
  }

  onSetActiveDialogue(uid: string) {
    this.activeDialogue = uid;
  }

  scrollToPanel(i: number) {
    this.dialogueItems.toArray()[i]._body.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  getDialogUID(item: any) {
    return item.controls.uid.value;
  }

  getNPC(item: any) {
    return item.controls.npc.value;
  }

  getType(item: any) {
    return item.controls.type.value;
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
        x: 64 - this.form.get('editor')?.get('viewPos')?.get('x')?.value / this.form.get('editor')?.get('viewPos')?.get('scale')?.value,
        y: 64 - this.form.get('editor')?.get('viewPos')?.get('y')?.value / this.form.get('editor')?.get('viewPos')?.get('scale')?.value,
      })
    });
  }

  addDialogue(): void {
    let newDialogue = this.createDialogue();
    this.getDialogue().push(newDialogue);
    this.activeDialogue = newDialogue.controls['uid'].value;
  }

  deleteDialogue(index: number): void {
    this.activeDialogue = '';
    this.getDialogue().removeAt(index);
    // TODO: Remove references
  }

  getDialogueItemById(id: string) {
    return this.getDialogue().value.map((p: any) => ({ ...p, index: this.getDialogue().value.indexOf(p) })).find((x: any) => x.uid === id);
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

    if (data.name) this.form.get('name')?.setValue(data.name);
    if (data.key) this.form.get('key')?.setValue(data.key);
    if (data.start) {
      this.form.get('start')?.setValue(data.start);
      this.activeDialogue = data.start;
    };

    if (data.editor) this.form.get('editor')?.setValue(
      {
        viewPos: data.editor.viewPos,
        startPos: data.editor.startPos
      }
    );

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

        if (dialogueItem.editor) {
          (dialogueItemFormGroup.get('editor') as FormGroup)?.patchValue({
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
