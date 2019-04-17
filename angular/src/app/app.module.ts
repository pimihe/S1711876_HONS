import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

//services
import { FileService } from './service/file.service';
import { ProcessingFileService } from './service/processing-file.service';
import { ProcessingServerService } from './service/processing-server.service';
import { StorageServerService } from './service/storage-server.service';
import { UserService } from './service/user.service';
import { NotificationService } from './service/notification.service';
import { FileViewService } from './service/file-view.service';
import { FileCommentService } from './service/file-comment.service';
import { FileRatingService } from './service/file-rating.service';
import { SharedService } from './service/shared.service';
import { AuthService } from './service/auth.service';

import { 
  MatSidenavModule,
  MatCheckboxModule,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatCardModule,
  MatExpansionModule,
  MatProgressBarModule,
  MatSliderModule,
  MatProgressSpinnerModule,
  MatMenuModule,
  MatTableModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatBadgeModule,
  MatSelectModule,
  MatSnackBarModule,
  MatTabsModule,
  MatTooltipModule,
  MatChipsModule,
  MatPaginatorModule,
} from '@angular/material';

//guard
import { AuthGuard } from './guards/auth.guard';

//routes
import { HomeComponent } from './route/home/home.component';
import { ViewContentComponent } from './route/view-content/view-content.component';
import { UploadComponent } from './route/upload/upload.component';
import { ProfileComponent } from './route/profile/profile.component';
import { SearchComponent } from './route/search/search.component';

//components
import { FilePreviewComponent } from './component/file-preview/file-preview.component';
import { VideoPlayerComponent } from './component/video-player/video-player.component';
import { DialogFileReportComponent } from './component/dialog-file-report/dialog-file-report.component';
import { ProcessingFileComponent } from './component/processing-file/processing-file.component';
import { ProfileUploadManagerComponent } from './component/profile-upload-manager/profile-upload-manager.component';
import { NotificationContainerComponent } from './component/notification-container/notification-container.component';
import { HeaderComponent } from './component/header/header.component';
import { FeedbackComponent } from './component/feedback/feedback.component';
import { UploadFileComponent } from './component/upload-file/upload-file.component';
import { DialogConfirmComponent } from './component/dialog-confirm/dialog-confirm.component';
import { DialogFileEditComponent } from './component/dialog-file-edit/dialog-file-edit.component';
import { FileQueryComponent } from './component/file-query/file-query.component';
import { CommentQueryComponent } from './component/comment-query/comment-query.component';
import { DialogProfilePictureComponent } from './component/dialog-profile-picture/dialog-profile-picture.component';
import { CustomPaginatorComponent } from './component/custom-paginator/custom-paginator.component';
import { ProfileCommentManagerComponent } from './component/profile-comment-manager/profile-comment-manager.component';
import { ProfilePlaceholderComponent } from './component/profile-placeholder/profile-placeholder.component';
import { DialogTextInputComponent } from './component/dialog-text-input/dialog-text-input.component';
import { DialogRegisterLoginComponent } from './component/dialog-register-login/dialog-register-login.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FilePreviewComponent,
    ViewContentComponent,
    VideoPlayerComponent,
    UploadComponent,
    ProfileComponent,
    ProcessingFileComponent,
    NotificationContainerComponent,
    HeaderComponent,
    SearchComponent,
    FeedbackComponent,
    UploadFileComponent,
    DialogFileReportComponent,
    DialogConfirmComponent,
    DialogFileEditComponent,
    FileQueryComponent,
    CommentQueryComponent,
    DialogProfilePictureComponent,
    ProfileUploadManagerComponent,
    CustomPaginatorComponent,
    ProfileCommentManagerComponent,
    ProfilePlaceholderComponent,
    DialogTextInputComponent,
    DialogRegisterLoginComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,

    MatSidenavModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    MatMenuModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatBadgeModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatTabsModule,
    MatPaginatorModule,
  ],
  providers: [
    FileService,
    FileViewService,
    ProcessingFileService,
    ProcessingServerService,
    StorageServerService,
    UserService,
    NotificationService,
    FileCommentService,
    FileRatingService,
    SharedService,
    AuthService,
    AuthGuard,
  ],
  bootstrap: [
    AppComponent
  ],
  entryComponents: [
    DialogRegisterLoginComponent,
    DialogFileReportComponent,
    DialogConfirmComponent,
    FeedbackComponent,
    DialogFileEditComponent,
    DialogProfilePictureComponent,
    DialogTextInputComponent,
  ]
})
export class AppModule { }