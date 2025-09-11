import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from './auth/registration/registration.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { UserBlogsComponent } from './blog/components/user-blogs/user-blogs.component';
import { CreateTourComponent } from './tour/create-tour/create-tour.component';
import { DetailsTourComponent } from './tour/details-tour/details-tour.component';

const routes: Routes = [
    { path: '', component: HomeComponent }, // početna stranica
    { path: 'register', component: RegistrationComponent },
    { path: 'login', component: LoginComponent},
    { path: 'adminHome', component: AdminHomeComponent},
    { path: 'blogs', component: UserBlogsComponent},
    { path: 'create-tour', component: CreateTourComponent},
    { path: 'tours', component: DetailsTourComponent}
    
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
