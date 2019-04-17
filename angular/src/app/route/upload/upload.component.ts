import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProcessingServerService } from '../../service/processing-server.service';
import { ProcessingFileService } from '../../service/processing-file.service';
import { SharedService } from '../../service/shared.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  public fileList: FileList[] = [];
  public fileListCpy = [];
  public isHovering: boolean = false;
  public processingFiles = [];
  
  constructor(
    public ProcessingServerService:ProcessingServerService,
    public ProcessingFileService:ProcessingFileService,
    public SharedService:SharedService,
  ) { }

  async ngOnInit() {
    // TODO: error checking
    let procFiles;
    try {
      procFiles = await this.ProcessingFileService.getFiles().toPromise()
      if(procFiles) this.processingFiles = procFiles.data;
    } catch (error) {
      console.log(error)
    }

    console.log(this.processingFiles);
    
  }

  removeFile(i,j){
    console.log(i,j)
    this.fileListCpy[i][j] = null;
  }

  public onDragFileOverStart(event) {
    event.preventDefault();
    event.stopPropagation();
    this.isHovering = true;
  };

  public onDragFileOverEnd(event) {
    event.preventDefault();
    event.stopPropagation();
    this.isHovering = false;
  }

  onDragFileDrop(event){
    event.preventDefault();
    event.stopPropagation();
    this.isHovering = false;
    this.fileChange(event);
  }

  fileChange(event){
    const listLngth = this.fileList.length;
    this.fileListCpy[listLngth] = [];
    this.fileList[listLngth] =  event.target.files || event.dataTransfer.files;
    // copy files into copy var
    for (let i = 0; i < this.fileList[listLngth].length; i++) {
      this.fileListCpy[listLngth][i] = this.fileList[listLngth][i];
    }
    
  }

}
