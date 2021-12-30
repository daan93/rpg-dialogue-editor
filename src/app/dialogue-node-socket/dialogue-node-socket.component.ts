import { Component, OnInit, Input, ElementRef } from '@angular/core';

export interface Socket {
  uid: number,
  x: number,
  y: number
};

@Component({
  selector: 'app-dialogue-node-socket',
  templateUrl: './dialogue-node-socket.component.html',
  styleUrls: ['./dialogue-node-socket.component.scss']
})
export class DialogueNodeSocketComponent implements OnInit {
  @Input() uid: number = 0;
  @Input() type: 'input' | 'output' = 'input';
  nativeElement;

  constructor(element: ElementRef) { 
    this.nativeElement = element.nativeElement;
  }

  ngOnInit(): void {
  }

}
