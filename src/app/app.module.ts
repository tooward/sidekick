import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxTypedJsModule } from 'ngx-typed-js';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { UserComponent } from './components/usermgt/user/user.component';
import { SignInComponent } from './components/usermgt/sign-in/sign-in.component';
import { SignUpComponent } from './components/usermgt/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './components/usermgt/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './components/usermgt/verify-email/verify-email.component';
import { AuthService } from "./components/usermgt/services/auth.service";

import { AngularFireModule } from "@angular/fire/compat";
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './components/header/header.component';
import { CommentComponent } from './components/comments/comment/comment.component';
import { CommentEditComponent } from './components/comments/comment-edit/comment-edit.component';
import { CommentlistComponent } from './components/comments/comment-list/comment-list.component';
import { TestuiComponent } from './components/comments/test/testui.component';

@NgModule({
  declarations: [
    AppComponent,
    UserComponent,
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent,
    PageNotFoundComponent,
    HomeComponent,
    HeaderComponent,
    CommentComponent,
    CommentEditComponent,
    CommentlistComponent,
    TestuiComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    AngularFireModule.initializeApp(environment.firebase),
    NgxTypedJsModule
  ],
  providers: [
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
