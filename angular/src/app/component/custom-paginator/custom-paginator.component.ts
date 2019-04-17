import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-custom-paginator',
  templateUrl: './custom-paginator.component.html',
  styleUrls: ['./custom-paginator.component.scss']
})
export class CustomPaginatorComponent implements OnInit {

  @Input() page;
  @Input() pageLength;
  @Input() perPage;

  public goToPageNo;

  @Output() pageEvent: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  emitEvent(){ 
    this.pageEvent.emit({page:this.page,perPage:this.perPage});
  }

  goToPage(){
    this.page = this.goToPageNo;
    this.emitEvent();
  }

}
