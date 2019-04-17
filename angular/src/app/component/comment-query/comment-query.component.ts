import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FileCommentService } from '../../service/file-comment.service';
import { FeedbackService } from '../../service/feedback.service';
import { UserService } from '../../service/user.service';
import { AuthService } from '../../service/auth.service';
import { SharedService } from '../../service/shared.service';

@Component({
  selector: 'app-comment-query',
  templateUrl: './comment-query.component.html',
  styleUrls: ['./comment-query.component.scss']
})
export class CommentQueryComponent implements OnInit {

  @Input() perPage = this.ActivatedRoute.snapshot.data.perPage;
  @Input() uploader;
  @Input() fileRef = "";
  @Input() headerText;
  @Input() sort = "";
  @Input() showMoreVisible = this.ActivatedRoute.snapshot.data.showMoreVisible;

  public commentJson = [];

  public newComment = '';

  public contentLoading = true;
  public getContentFail = false;

  public profilePicAddressObj: object = {};

  constructor(
    private ActivatedRoute: ActivatedRoute,
    public FileCommentService: FileCommentService,
    public UserService: UserService,
    private FeedbackService: FeedbackService,
    private AuthService: AuthService,
    private SharedService: SharedService,
  ) { }

  async ngOnInit() {

    this.uploader = await new Promise((resolve, reject)=>{
      this.ActivatedRoute.parent.params.subscribe(params => {
        if(params.user) return resolve(params.user); 
        return resolve('');
      })
    })

    this.ActivatedRoute.queryParams.subscribe(async (params)=>{
      this.commentJson = [];
      this.contentLoading = true;
      //this.searchString = params.query || "";
      try {
        const comments: any = await this.getCommentData(0);
        this.commentJson = comments;
        this.contentLoading = false;
      } catch (error) {
        this.getContentFail = true;
      }
    })
  }

  public gettingMore = false;
  public noMoreComments = false;
  async getMore() {
    this.gettingMore = true;
    const comments: any = await this.getCommentData(this.commentJson.length);
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      await (new Promise((resolve)=>{setTimeout(() => {return resolve(true)})}))
      this.commentJson.push(comment);
    }
    this.gettingMore = false;
    if(comments.length<this.perPage) this.noMoreComments=true;
  }

  getCommentData(skipNo){return new Promise((resolve,reject)=>{
    this.FileCommentService.queryComments(this.fileRef,this.sort,this.perPage,skipNo,this.uploader).subscribe(
      (data)=>{
        this.contentLoading = false;
        return resolve(data.data)
      },
      (err)=>{
        this.getContentFail = true;
        return reject(err)
      }
    )
  })}

  postComment() {
    if(!this.AuthService.getDecodedUser()) {
      this.FeedbackService.openSnackBar("Login or register to use this feature",false,3500);
      return this.SharedService.getDisplayLoginObs().next();
    };
    this.FileCommentService.postComment(this.fileRef, this.newComment).subscribe(
      (data)=>{
        this.commentJson.unshift(data.data);
        this.newComment = '';
      },
      (err)=>{
        this.FeedbackService.openSnackBar("Failed to add comment", false, 3500);
      }
    )
  }
}
