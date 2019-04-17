import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FileService } from '../../service/file.service';

@Component({
  selector: 'app-file-query',
  templateUrl: './file-query.component.html',
  styleUrls: ['./file-query.component.scss']
})
export class FileQueryComponent implements OnInit {

  @Input() perPage = this.ActivatedRoute.snapshot.data.perPage || 12;
  @Input() uploader;
  @Input() type = "";
  @Input() searchString;
  @Input() random = "";

  @Input() showMoreVisible = this.ActivatedRoute.snapshot.data.showMoreVisible;
  @Input() headerText;

  public fileJson = [];
  public contentLoading = true;

  public fileJsonFail: boolean = false;

  constructor(
    private Router: Router,
    private ActivatedRoute: ActivatedRoute,
    public FileService: FileService,
  ) { }

  async ngOnInit() { 
    this.searchString = await new Promise((resolve, reject)=>{
      this.ActivatedRoute.queryParams.subscribe((params)=>{
        return resolve(params.query || "");
      })
    });
    this.uploader = await new Promise((resolve, reject)=>{
      this.ActivatedRoute.parent.params.subscribe(params => {
        if(params.user) return resolve(params.user); 
        return resolve('');
      })
    })

    this.ActivatedRoute.queryParams.subscribe(async (params)=>{
      this.fileJson = [];
      this.contentLoading = true;
      this.searchString = params.query || "";
      try {
        const files: any = await this.getFileData(0);
        this.fileJson = files;
        this.contentLoading = false;
      } catch (error) {
        this.fileJsonFail = true;
      }
    })
  }

  public gettingMore = false;
  public noMoreFiles = false;
  async getMore() {
    this.gettingMore = true;
    const files: any = await this.getFileData(this.fileJson.length);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await (new Promise((resolve)=>{setTimeout(() => {return resolve(true)})}))
      this.fileJson.push(file);
    }
    this.gettingMore = false;
    if(files.length<this.perPage) this.noMoreFiles=true;
  }

  getFileData(skipNo){return new Promise((resolve,reject)=>{
    this.FileService.queryFiles(this.searchString,this.type,"",this.perPage,skipNo,this.random,this.uploader).subscribe(
      (data)=>{
        this.contentLoading = false;
        return resolve(data.data)
      },
      (err)=>{
        this.fileJsonFail = true;
        return reject(err)
      }
    )
  })}
}


    // try {
    //   this.contentLoading = true;
    //   const files: any = await this.getFileData(0);
    //   this.fileJson = files;
    //   this.contentLoading = false;
    // } catch (error) {
    //   this.fileJsonFail = true;
    // }