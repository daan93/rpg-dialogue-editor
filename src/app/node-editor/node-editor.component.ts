import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, FormControl } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import * as uuid from 'uuid';
import panzoom from 'panzoom';
import { PanZoom } from 'panzoom';

import { Socket } from './../dialogue-node-socket/dialogue-node-socket.component';
import { DialogueNodeComponent } from './../dialogue-node/dialogue-node';

@Component({
  selector: 'app-node-editor',
  templateUrl: './node-editor.component.html',
  styleUrls: ['./node-editor.component.scss']
})
export class NodeEditorComponent implements OnInit {
  @Input() dialogue!: FormArray;

  preview: string = '';
  zoomScale = 1;
  panzoomCanvas!: PanZoom;
  sockets: Socket[] = [];

  @ViewChild('canvas') canvasElement!: ElementRef;

  @ViewChildren(DialogueNodeComponent) dialogueNodes!: QueryList<DialogueNodeComponent>;

  constructor(private cd: ChangeDetectorRef) { }

  ngAfterViewInit() {
    console.log('afterviewinit');

    this.panzoomCanvas = panzoom(this.canvasElement.nativeElement, {
      maxZoom: 1,
      minZoom: 0.1,
    });

    this.panzoomCanvas.on('transform', (e) => {
      let result = this.panzoomCanvas.getTransform();
      this.zoomScale = result.scale;
    });
    
    this.cd.detectChanges();
  }

  ngOnInit(): void {
  }

  getDialogUID(item: any) {
    return item.controls.uid.value;
  }

  getDialogueItemById(id: string) {
    return this.dialogue.value.map((p: any) => ({ ...p, index: this.dialogue.value.indexOf(p) })).find((x: any) => x.uid === id);
  }

  pausePanzoom() {
    this.panzoomCanvas.pause();
  }

  resumePanzoom() {
    this.panzoomCanvas.resume();
  }

  getResponsePath(item: any, response: any) {
    if (!this.dialogueNodes) return;

    let dialogueNode = this.dialogueNodes.toArray().map((p: any) => ({ ...p, index: this.dialogueNodes.toArray().indexOf(p) })).find((x: any) => x.uid === item.controls['uid'].value);
    let socket = dialogueNode.sockets.toArray().map((p: any) => ({ ...p, index: dialogueNode.sockets.toArray().indexOf(p) })).find((x: any) => x.uid === response.uid);

    let followUpDialogueNode = this.dialogueNodes.toArray().map((p: any) => ({ ...p, index: this.dialogueNodes.toArray().indexOf(p) })).find((x: any) => x.uid === response.followUp);
    let followUpsocket = followUpDialogueNode.sockets.toArray().map((p: any) => ({ ...p, index: followUpDialogueNode.sockets.toArray().indexOf(p) })).find((x: any) => x.uid === response.followUp);

    let points = {
      start: {
        x: dialogueNode.draggedPos.x + socket.nativeElement.offsetLeft + 8,
        y: dialogueNode.draggedPos.y + socket.nativeElement.offsetTop + 8,
      },
      end: {
        x: followUpDialogueNode.draggedPos.x + followUpsocket.nativeElement.offsetLeft + 8,
        y: followUpDialogueNode.draggedPos.y + followUpsocket.nativeElement.offsetTop + 8,
      }
    }

    return `M ${points.start.x},${points.start.y} 
    C ${points.start.x + 50},${points.start.y}  
      ${points.end.x - 50},${points.end.y}  
      ${points.end.x},${points.end.y}`
  }

  updateSockets(event: any) {
    console.log(event);
  }

}
