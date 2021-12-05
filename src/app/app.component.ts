import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, FormControl } from '@angular/forms';
import * as uuid from 'uuid';

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

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.form.valueChanges.subscribe(val => {
      // update JSON
    });

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
      responses: new FormArray([])
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
          responses: new FormArray([])
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

        this.getDialogue().push(dialogueItemFormGroup);
      });

      this.import.reset();
    }
  }
}
