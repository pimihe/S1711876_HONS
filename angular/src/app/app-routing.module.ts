import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './route/home/home.component';
import { ViewContentComponent } from './route/view-content/view-content.component';
import { UploadComponent } from './route/upload/upload.component';
import { ProfileComponent } from './route/profile/profile.component';
import { ProfileUploadManagerComponent } from './component/profile-upload-manager/profile-upload-manager.component';
import { ProfileCommentManagerComponent } from './component/profile-comment-manager/profile-comment-manager.component';
import { SearchComponent } from './route/search/search.component';
import { CommentQueryComponent } from './component/comment-query/comment-query.component';
import { FileQueryComponent } from './component/file-query/file-query.component';
import { ProfilePlaceholderComponent } from './component/profile-placeholder/profile-placeholder.component';

import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '',                component: HomeComponent },
  { path: 'view/:reference', component: ViewContentComponent },
  { path: 'upload',          component: UploadComponent, canActivate:[AuthGuard]},
  { path: 'profile/:user', component: ProfileComponent, children: [
    {path: '', redirectTo: 'uploads', pathMatch:'prefix'},
    {path: 'uploads', component: FileQueryComponent, data: { 
      perPage: 24, 
      showMoreVisible: true
    }},
    {path: 'comments', component: CommentQueryComponent, data: { 
      perPage: 12, 
      showMoreVisible: true
    }},
    {path: 'upload-manager', component: ProfileUploadManagerComponent},
    {path: 'comment-manager', component: ProfileCommentManagerComponent},
    {path: 'comment-manager', component: ProfileCommentManagerComponent},
    {path: 'place-holder', component: ProfilePlaceholderComponent},
  ]},
  { path: 'search',          component: SearchComponent},
  { path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

//{ path: '', redirectTo: '/home', pathMatch: 'full' },