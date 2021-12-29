import { CdkDrag } from '@angular/cdk/drag-drop';
import { Component, Input, Output, EventEmitter, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Point, DragRef, CdkDragStart, CdkDragMove, CdkDragEnd } from '@angular/cdk/drag-drop';
import { DialogueNodeSocketComponent } from '../dialogue-node-socket/dialogue-node-socket.component';
import { Socket } from '../dialogue-node-socket/dialogue-node-socket.component';

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
  _pos = {x: 0, y: 0 };
  @Input() 
  get pos() { 
    return this._pos
  };
  set pos(pos: any) {
    this._pos = this.draggedPos = pos;
    console.log('updated node pos');
  }
  @Input() item: any = {};

  @Output() dragStart = new EventEmitter<any>();
  @Output() dragEnd = new EventEmitter<any>();
  @Output() positionsUpdated = new EventEmitter<any>();

  draggedPos = { x: 0, y: 0 };
  uid!: number;
  dragDisabled = false;

  get socketPosition() {
    return (uid: number) => {
      let socket = this.sockets.toArray().map((p: any) => ({ ...p, index: this.sockets.toArray().indexOf(p) })).find((x: any) => x.uid === uid);

      return {
        x: this.pos.x + socket.nativeElement.offsetTop,
        y: this.pos.y + socket.nativeElement.offsetLeft,
      }
    }
  }

  @ViewChildren(DialogueNodeSocketComponent) sockets!: QueryList<DialogueNodeSocketComponent>;

  ngOnInit() {
    this.uid = this.item.uid;
  }

  socketDown() {
    this.dragDisabled = true;
    this.dragStart.emit();
  }

  socketUp() {
    this.dragDisabled = false;
    this.dragEnd.emit();
  }

  dragConstrainPoint = (point: Point, dragRef: DragRef) => {
    let zoomMoveXDifference = 0;
    let zoomMoveYDifference = 0;
    // console.log(
    //   'freeDragPosition dragRef: ' +
    //     Math.round(dragRef.getFreeDragPosition().x) +
    //     ' / ' +
    //     Math.round(dragRef.getFreeDragPosition().y)
    // );

    if (this.zoomScale != 1) {
      zoomMoveXDifference =
        (1 - this.zoomScale) * dragRef.getFreeDragPosition().x;
      zoomMoveYDifference =
        (1 - this.zoomScale) * dragRef.getFreeDragPosition().y;
    }
    // console.log(
    //   'zoomMoveXDifference x/y: ' +
    //     Math.round(zoomMoveXDifference) +
    //     ' / ' +
    //     Math.round(zoomMoveYDifference)
    // );
    // console.log(
    //   'Point x/y: ' + Math.round(point.x) + ' / ' + Math.round(point.y)
    // );
    // console.log(
    //   'Sum x/y: ' +
    //     Math.round(point.x + zoomMoveXDifference) +
    //     ' / ' +
    //     Math.round(point.y + zoomMoveYDifference)
    // );

    return {
      x: point.x + zoomMoveXDifference,
      y: point.y + zoomMoveYDifference,
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
    /* The getBoundingClientRect() method returns the size of an element and its position relative to the viewport.
    This method returns a DOMRect object with eight properties: left, top, right, bottom, x, y, width, height. https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_element_getboundingclientrect*/
    // console.log(
    //   'elementMovingParentElementRect .left/.top: ' +
    //     Math.trunc(elementMovingParentElementRect.left) +
    //     ' / ' +
    //     Math.trunc(elementMovingParentElementRect.top)
    // );
    // console.log(
    //   'elementMovingRect .left/.top: ' +
    //     Math.trunc(elementMovingRect.left) +
    //     ' / ' +
    //     Math.trunc(elementMovingRect.top)
    // );
    // console.log(
    //   'Difference scaled .left/.top: ' +
    //     Math.trunc(
    //       (elementMovingRect.left - elementMovingParentElementRect.left) /
    //         this.zoomScale
    //     ) +
    //     ' / ' +
    //     Math.trunc(
    //       (elementMovingRect.top - elementMovingParentElementRect.top) /
    //         this.zoomScale
    //     )
    // );

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
    /* The getBoundingClientRect() method returns the size of an element and its position relative to the viewport.
    This method returns a DOMRect object with eight properties: left, top, right, bottom, x, y, width, height. https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_element_getboundingclientrect*/
    // console.log(
    //   'elementMovingParentElementRect .left/.top: ' +
    //     Math.trunc(elementMovingParentElementRect.left) +
    //     ' / ' +
    //     Math.trunc(elementMovingParentElementRect.top)
    // );
    // console.log(
    //   'elementMovingRect .left/.top: ' +
    //     Math.trunc(elementMovingRect.left) +
    //     ' / ' +
    //     Math.trunc(elementMovingRect.top)
    // );
    // console.log(
    //   'Difference scaled .left/.top: ' +
    //     Math.trunc(
    //       (elementMovingRect.left - elementMovingParentElementRect.left) /
    //         this.zoomScale
    //     ) +
    //     ' / ' +
    //     Math.trunc(
    //       (elementMovingRect.top - elementMovingParentElementRect.top) /
    //         this.zoomScale
    //     )
    // );

    this.pos.x =
      (elementMovingRect.left - elementMovingParentElementRect.left) /
      this.zoomScale;
    this.pos.y =
      (elementMovingRect.top - elementMovingParentElementRect.top) /
      this.zoomScale;

    const cdkDrag = $event.source as CdkDrag;
    cdkDrag.reset();

    this.dragEnd.emit();
  }
}
