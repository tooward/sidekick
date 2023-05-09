import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignInComponent } from './components/usermgt/sign-in/sign-in.component';
import { SignUpComponent } from './components/usermgt/sign-up/sign-up.component';
import { UserComponent } from './components/usermgt/user/user.component';
import { ForgotPasswordComponent } from './components/usermgt/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './components/usermgt/verify-email/verify-email.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';
import { CommentComponent } from './components/comments/comment/comment.component';
import { CommentEditComponent } from './components/comments/comment-edit/comment-edit.component';
import { CommentlistComponent } from './components/comments/comment-list/comment-list.component';
import { AuthGuard } from './shared/guard/auth.guard';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'register-user', component: SignUpComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify-email-address', component: VerifyEmailComponent },
  { path: 'user', component: UserComponent, canActivate: [AuthGuard] },
  { path: 'comment/:id', component: CommentComponent, canActivate: [AuthGuard] },
  { path: 'edit/:id', component: CommentEditComponent, canActivate: [AuthGuard] },
  { path: 'edit', component: CommentEditComponent, canActivate: [AuthGuard] },
  { path: 'comments', component: CommentlistComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], //, { enableTracing: true })],
  exports: [RouterModule],
})

export class AppRoutingModule {}