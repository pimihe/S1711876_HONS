import { Component, OnInit } from '@angular/core';
import { FileService } from '../../service/file.service';
import { trigger, state, style, transition, animate } from "@angular/animations"

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public videoJson: object;
  public videoJsonFail: boolean = false;
  public imageJson: object;
  public imageJsonFail: boolean = false;
  public randVideoJson: object;
  public randVideoJsonFail: boolean = false;
  public randImageJson: object;
  public randImageJsonFail: boolean = false;

  constructor(public FileService: FileService) { }

  ngOnInit() {
    this.FileService.queryFiles("","video","descending",12,1,"","").subscribe(
      (res)=>{
        this.videoJson = res.data;
      },
      (err)=>{
        this.videoJsonFail = true;
      }
    )
    this.FileService.queryFiles("","image","descending",12,1,"","").subscribe(
      (res)=>{
        this.imageJson = res.data;
      },
      (err)=>{
        this.imageJsonFail = true;
      }
    )
    this.FileService.queryFiles("","video","",12,1,true,"").subscribe(
      (res)=>{
        this.randVideoJson = res.data;
      },
      (err)=>{
        this.randVideoJsonFail = true;
      }
    )
    this.FileService.queryFiles("","image","",12,1,true,"").subscribe(
      (res)=>{
        this.randImageJson = res.data;
      },
      (err)=>{
        this.randImageJsonFail = true;
      }
    )

  }

}
