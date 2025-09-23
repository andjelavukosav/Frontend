import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegistrationComponent } from './auth/registration/registration.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { MaterialModule } from './auth/material/material.module';
import { JwtInterceptor } from './auth/jwt/jwt.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { UserBlogsComponent } from './blog/components/user-blogs/user-blogs.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateBlogDialogComponent } from './blog/components/create-blog-dialog/create-blog-dialog.component';
import { MarkdownModule } from 'ngx-markdown';
import { BlogDetailsComponent } from './blog/components/blog-details/blog-details.component';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { CreateTourComponent } from './tour/create-tour/create-tour.component';
import { DetailsTourComponent } from './tour/details-tour/details-tour.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import './leaflet-config';
import { CreateKeypointDialogComponent } from './tour/create-keypoint-dialog/create-keypoint-dialog.component';
import { KeyPointDetailsDialogComponent } from './tour/key-point-details-dialog/key-point-details-dialog.component';
import { PositionSimulatorComponent } from './position-simulator/position-simulator.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { PublishTourComponent } from './tour/publish-tour/publish-tour.component';
import { ShoppingCartComponent } from './tour/shopping-cart/shopping-cart.component';
import { PurchasedToursComponent } from './tour/purchased-tours/purchased-tours.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent,
    NavbarComponent,
    HomeComponent,
    AdminHomeComponent,
    UserBlogsComponent,
    CreateBlogDialogComponent,
    BlogDetailsComponent,
    ConfirmDialogComponent,
    CreateTourComponent,
    DetailsTourComponent,
    CreateKeypointDialogComponent,
    KeyPointDetailsDialogComponent,
    PositionSimulatorComponent,
    PublishTourComponent,
    ShoppingCartComponent,
    PurchasedToursComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,
    BrowserAnimationsModule, 
    ReactiveFormsModule,
    BrowserAnimationsModule, 
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MarkdownModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
