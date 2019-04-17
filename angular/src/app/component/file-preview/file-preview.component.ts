import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss']
})
export class FilePreviewComponent implements OnInit {

  @Input() file;

  constructor() { }

  ngOnInit() {}

  public formatDuration(rawSecs){
    
    var hour,mins,secs;
    if(rawSecs>=3600){
      hour = Math.floor(rawSecs/3600);
      rawSecs = rawSecs-(hour*3600);
    }
    if(rawSecs>=60){
      mins = Math.floor(rawSecs/60);
      rawSecs = rawSecs-(mins*60);
      (mins.toString().length < 2)?mins = '0'+mins.toString():null;
    }else{mins='00'}
    if(rawSecs>=1){
      secs = Math.floor(rawSecs);
      rawSecs = rawSecs-(mins);
      (secs.toString().length < 2)?secs = '0'+secs.toString():null;
    }else{secs='00'}
    return (hour>0) ? hour+':'+mins+':'+secs : mins+':'+secs;
  }

}
