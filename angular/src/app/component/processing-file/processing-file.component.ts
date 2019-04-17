import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-processing-file',
  templateUrl: './processing-file.component.html',
  styleUrls: ['./processing-file.component.scss']
})
export class ProcessingFileComponent implements OnInit {


  @Input() file;

  constructor() { }

  ngOnInit() {
  }

  removeFile(e){
    this.prevDefaultAndProp(e);
    this.file = null;
  }

  prevDefaultAndProp(event){
    event.preventDefault();
    event.stopPropagation();
  }

}
