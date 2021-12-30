import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, HostListener, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
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
  styleUrls: ['./node-editor.component.scss'],
})
export class NodeEditorComponent implements OnInit {
  @Input() dialogue!: FormArray;

  nativeElement;
  panzoomTransform = {scale: 1, x: 0, y: 0};
  panzoomCanvas!: PanZoom;
  sockets: Socket[] = [];
  addNewConnection: any = null;
  mousePosition: any = {x: 0, y: 0};

  @Output() setResponseFollowUp = new EventEmitter<any>();
  @Output() setNodePosition = new EventEmitter<any>();

  @ViewChild('canvas') canvasElement!: ElementRef;

  @ViewChildren(DialogueNodeComponent) dialogueNodes!: QueryList<DialogueNodeComponent>;

  @HostListener('mousemove', ['$event']) 
  onMouseMove(e: MouseEvent) {
    this.mousePosition = {x: e.x, y: e.y}
  }

  @HostListener('mouseup', ['$event']) 
  onMouseUp(e: MouseEvent) {
    if (this.addNewConnection) this.addNewConnection = null;
    this.dialogueNodes.forEach((node: DialogueNodeComponent) => { node.dragDisabled = false});
  }

  constructor(
    private cd: ChangeDetectorRef,
    private element: ElementRef) { 
    this.nativeElement = element.nativeElement;
  }

  ngAfterViewInit() {
    this.panzoomCanvas = panzoom(this.canvasElement.nativeElement, {
      maxZoom: 1,
      minZoom: 0.1,
    });

    this.panzoomCanvas.on('transform', (e) => {
      this.panzoomTransform = this.panzoomCanvas.getTransform();
    });
    
    this.cd.detectChanges();
  }

  ngOnInit(): void {
  }

  onSocketDown(event: any) {
    this.addNewConnection = event;
    this.pausePanzoom();
  }

  onSocketUp(event: any) {
    if (event.type === 'input' && this.addNewConnection.type === 'output') {
      this.setResponseFollowUp.emit({
        item: this.addNewConnection.itemUID, 
        response: this.addNewConnection.socketUID, 
        followUp: event.itemUID });
    }
    else if (event.type === 'output' && this.addNewConnection.type === 'input') {
      this.setResponseFollowUp.emit({
        item: event.itemUID, 
        response: event.socketUID, 
        followUp: this.addNewConnection.itemUID });
    }
    this.addNewConnection = null;
    this.resumePanzoom();
  }

  getNewResponsePath() {
    const dialogueNode = this.dialogueNodes.toArray().map((p: any) => ({ ...p, index: this.dialogueNodes.toArray().indexOf(p) })).find((x: any) => x.item.uid === this.addNewConnection.itemUID);
    const socket = dialogueNode.sockets.toArray().map((p: any) => ({ ...p, index: dialogueNode.sockets.toArray().indexOf(p) })).find((x: any) => x.uid === this.addNewConnection.socketUID && x.type === this.addNewConnection.type);
    const nativeElementRect: ClientRect = this.nativeElement.getBoundingClientRect();

    const points = {
      start: {
        x: dialogueNode.draggedPos.x + socket.nativeElement.offsetLeft + 8,
        y: dialogueNode.draggedPos.y + socket.nativeElement.offsetTop + 8,
      },
      end: {
        x: (this.mousePosition.x - this.panzoomTransform.x) / this.panzoomTransform.scale - nativeElementRect.left / this.panzoomTransform.scale,
        y: (this.mousePosition.y - this.panzoomTransform.y) / this.panzoomTransform.scale - nativeElementRect.top / this.panzoomTransform.scale,
      }
    }

    const pathDirection = this.addNewConnection.type === 'output' ? 1 : -1;

    return `M ${points.start.x},${points.start.y} 
    C ${points.start.x + 50 * pathDirection},${points.start.y}  
      ${points.end.x - 50 * pathDirection},${points.end.y}  
      ${points.end.x},${points.end.y}`
  }

  getDialogUID(item: any) {
    return item.controls.uid.value;
  }

  getDialogueItemById(id: string) {
    return this.dialogue.value.map((p: any) => ({ ...p, index: this.dialogue.value.indexOf(p) })).find((x: any) => x.uid === id);
  }

  nodeDragEnd(event: any) {
    this.setNodePosition.emit(event);
    this.resumePanzoom();
  }

  pausePanzoom() {
    this.panzoomCanvas.pause();
  }

  resumePanzoom() {
    this.panzoomCanvas.resume();
  }

  getConnections(uid: string) {
    const item = this.getDialogueItemById(uid);
    if (item.type !== 'single' && item.followUp !== '') return [item];
    return this.getDialogueItemById(uid).responses.filter((response: any) => response.followUp !== '');
  }

  getResponsePath(item: any, response: any) {
    if (!this.dialogueNodes) return;

    let dialogueNode = this.dialogueNodes.toArray().map((p: any) => ({ ...p, index: this.dialogueNodes.toArray().indexOf(p) })).find((x: any) => x.item.uid === item.controls['uid'].value);
    let socket = dialogueNode.sockets.toArray().map((p: any) => ({ ...p, index: dialogueNode.sockets.toArray().indexOf(p) })).find((x: any) => x.uid === response.uid && x.type === 'output');

    let followUpDialogueNode = this.dialogueNodes.toArray().map((p: any) => ({ ...p, index: this.dialogueNodes.toArray().indexOf(p) })).find((x: any) => x.item.uid === response.followUp);
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
}
