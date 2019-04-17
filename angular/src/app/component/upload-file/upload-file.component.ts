import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild  } from '@angular/core';
import { ProcessingServerService } from '../../service/processing-server.service';
import { ProcessingFileService } from '../../service/processing-file.service';
import { FileService } from '../../service/file.service';
import { SharedService } from '../../service/shared.service';
import { HttpEventType } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit, OnDestroy {

  @ViewChild("expansionPanel") expansionPanelEle;
  
  @Input() fileToUp: File;
  // this is set once the file is uploaded and is processing thi is set to allow the component to check and see how the file is doing
  @Input() processingFileRef: string;

  // obj used to store values of the object or the File var
  public templateVars: any;
  
  public uploadSub: Subscription;

  public progress = "";
  public uploadInProgress;
  public networkErr;
  public fileErr;
  public noServer;
  public uploadSuccess = false;

  public serverBusyTimeout;

  public processingComplete = false;

  public processingFileCheck = setInterval(()=>{
    if(!this.uploadSuccess) return;
    this.ProcessingFileService.getFileByRef(this.processingFileRef).subscribe(
      (res)=>{
        console.log(res.data);
        this.progress = res.data.progress.toFixed(2)+"%";
        this.templateVars.status = res.data.status;
      },
      (err)=>{
        // TODO: check other errors here too
        // file not found so check to see if file is done processing
        if(err.status == 404){
          this.FileService.getFile(this.processingFileRef).subscribe(
            (res)=>{
              // TODO: more error checking here
              if(typeof res.data == "object"){
                clearInterval(this.processingFileCheck);
                this.processingComplete = true;
                this.templateVars.status = 3;
              }
            },
            (err)=>{
              clearInterval(this.processingFileCheck);
              console.log(err)
            }
          )
        }
        clearInterval(this.processingFileCheck);
      }
    )
  },1000)

  constructor(
    public ProcessingFileService:ProcessingFileService,
    public ProcessingServerService:ProcessingServerService,
    public FileService:FileService,
    public SharedService:SharedService,
  ) { }

  public getUpAllClickSub: Subscription;
  ngOnInit() {
    this.getUpAllClickSub = this.SharedService.getUpAllClickObs().subscribe(
      ()=>{this.uploadFile()}
    )
    this.templateVars = {};
    if(this.fileToUp) {
      this.templateVars.title = this.fileToUp.name.substr(0,this.fileToUp.name.lastIndexOf('.'));
      this.templateVars.description = "";
    }else{
      this.FileService.getFile(this.processingFileRef).subscribe(
        (res)=>{
          this.uploadSuccess = true;
          this.templateVars.title = res.data.title;
        },
        (err)=>{
          console.log(err);
        }
      )
    }
  }

  async uploadFile(e?){
    this.expansionPanelEle.expanded = false;
    if(e) this.prevDefaultAndProp(e);

    this.progress = '0.00%';
    this.uploadInProgress = true;
    this.networkErr = false;
    this.fileErr = false;
    this.noServer = false; // no server available

    // get server address to upload to 
    let serverGetObj;
    try {
      serverGetObj = await this.ProcessingServerService.getProcessingServer().toPromise();
    } catch (error) {
      return this.networkErr = true;
    }

    if (!serverGetObj.data){ // if getting a server was unsuccessful due to db example maybe
      this.progress = 'No servers available try again later'
      return this.networkErr = true;
    }

    if (serverGetObj.data == null){ // if server got stuff from db successfully but there are no available servers
      this.noServer = true;
      this.uploadInProgress = false;
      return this.progress = "All servers busy try again"
    }

    const serverAddress = serverGetObj.data.address
    this.sendFile(serverAddress);

  }

  sendFile(serverAddress) {
    //begin upload
    this.uploadSub = this.ProcessingServerService.uploadFile(
      serverAddress,
      this.templateVars.title,
      this.fileToUp
    ).subscribe(
      (e) => {
        if(e.type === HttpEventType.UploadProgress){
          this.progress = (100 * e.loaded / e.total).toFixed(2)+"%";
        }else if(e.type === HttpEventType.Response){
          const res:any = e.body;
          // if succesful set vars to give user feedback and remopve file after five seconds and return function
          if(res){
            this.processingFileRef = res.data.reference;
            this.uploadSuccess = true;
            /// run completed func
            this.progress = "0.00%";
            return;
          }

        }
      },
      (error)=>{
        this.progress = "Error"
        this.networkErr = true;

        //TODO figure out error handling here
        // if reaching here the request completed but there was an issue with the request
          // if(res.overCap){
          //   this.noServer = true;
          //   console.log(123)
          //   this.serverBusyTimeout = setTimeout(() => {this.uploadFile(e)}, 5000);
          //   //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
          //   this.progress = "All servers busy retrying...";
          // }else{//TODO: check for auth issues
          //   this.progress = "File type not supported";
          //   this.fileErr = true;
          // }
      }
    )
  }

  cancelUpload(e){
    if(e) this.prevDefaultAndProp(e);
    this.uploadInProgress = false;
    this.noServer = false;
    if(this.uploadSub) this.uploadSub.unsubscribe();
  }

  removeFile() {
    this.cancelUpload(null);
    this.templateVars = null;
    if(this.uploadSub) this.uploadSub.unsubscribe();
    if(this.processingFileCheck) clearInterval(this.processingFileCheck);
    if(this.getUpAllClickSub) this.getUpAllClickSub.unsubscribe();
  }

  prevDefaultAndProp(event){
    if(event.preventDefault) event.preventDefault();
    if(event.stopPropagation) event.stopPropagation();
  }

  ngOnDestroy() {
    if(this.serverBusyTimeout) clearInterval(this.serverBusyTimeout);
    if(this.processingFileCheck) clearInterval(this.processingFileCheck);
    if(this.uploadSub) this.uploadSub.unsubscribe();
    if(this.getUpAllClickSub) this.getUpAllClickSub.unsubscribe();
  }

}
