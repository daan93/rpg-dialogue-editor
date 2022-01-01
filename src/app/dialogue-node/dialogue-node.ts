import { CdkDrag } from '@angular/cdk/drag-drop';
import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { Point, DragRef, CdkDragStart, CdkDragMove, CdkDragEnd } from '@angular/cdk/drag-drop';
import { DialogueNodeSocketComponent } from '../dialogue-node-socket/dialogue-node-socket.component';

/**
 * @title Basic Drag&Drop
 */
@Component({
  selector: 'app-dialogue-node',
  templateUrl: 'dialogue-node.html',
  styleUrls: ['dialogue-node.scss'],
})
export class DialogueNodeComponent implements OnInit {
  @Input() zoomScale = 1;
  @Input() item: any = {};

  pos = { x: 0, y: 0 };
  draggedPos = { x: 0, y: 0 };
  dragDisabled = false;

  @Output() dragStart = new EventEmitter<any>();
  @Output() dragEnd = new EventEmitter<any>();
  @Output() socketDown = new EventEmitter<any>();
  @Output() socketUp = new EventEmitter<any>();
  @Output() positionsUpdated = new EventEmitter<any>();

  @ViewChildren(DialogueNodeSocketComponent) sockets!: QueryList<DialogueNodeSocketComponent>;

  ngOnInit() {
    this.pos = {
      x: this.item.editor.x,
      y: this.item.editor.y,
    }
    this.draggedPos = { ...this.pos }
  }

  InputSocketDown(uid: string) {
    this.dragDisabled = true;
    this.socketDown.emit({ type: 'input', itemUID: this.item.uid, socketUID: uid });
  }

  InputSocketUp(uid: string) {
    this.dragDisabled = false;
    this.socketUp.emit({ type: 'input', itemUID: this.item.uid, socketUID: uid });
  }

  OutputSocketDown(uid: string) {
    this.dragDisabled = true;
    this.socketDown.emit({ type: 'output', itemUID: this.item.uid, socketUID: uid });
  }

  OutputSocketUp(uid: string) {
    this.dragDisabled = false;
    this.socketUp.emit({ type: 'output', itemUID: this.item.uid, socketUID: uid });
  }

  dragConstrainPoint = (point: Point, dragRef: DragRef) => {
    let initialPosX = 0;
    let initialPosY = 0;

    if (dragRef.getFreeDragPosition().x !== 0 && dragRef.getFreeDragPosition().y !== 0) {
      initialPosX = this.pos.x;
      initialPosY = this.pos.y;
    }

    let zoomMoveXDifference =
      (1 - this.zoomScale) * dragRef.getFreeDragPosition().x
      - (1 - this.zoomScale) * initialPosX;
    let zoomMoveYDifference =
      (1 - this.zoomScale) * dragRef.getFreeDragPosition().y
      - (1 - this.zoomScale) * initialPosY;

    return {
      x: point.x + zoomMoveXDifference,
      y: point.y + zoomMoveYDifference
    };
  };

  startDragging($event: CdkDragStart) {
    this.dragStart.emit();
  }

  dragging($event: CdkDragMove) {
    const elementMoving = $event.source.getRootElement();
    const elementMovingRect: ClientRect = elementMoving.getBoundingClientRect();
    const elementMovingParentElementRect: ClientRect =
      elementMoving.parentElement!.getBoundingClientRect();

    this.draggedPos.x =
      (elementMovingRect.left - elementMovingParentElementRect.left) /
      this.zoomScale;
    this.draggedPos.y =
      (elementMovingRect.top - elementMovingParentElementRect.top) /
      this.zoomScale;
  }

  endDragging($event: CdkDragEnd) {
    const elementMoving = $event.source.getRootElement();
    const elementMovingRect: ClientRect = elementMoving.getBoundingClientRect();
    const elementMovingParentElementRect: ClientRect =
      elementMoving.parentElement!.getBoundingClientRect();

    this.pos.x =
      (elementMovingRect.left - elementMovingParentElementRect.left) /
      this.zoomScale;
    this.pos.y =
      (elementMovingRect.top - elementMovingParentElementRect.top) /
      this.zoomScale;
      
    this.dragEnd.emit({
      item: this.item.uid,
      x: this.pos.x,
      y: this.pos.y
    });
  }
}
