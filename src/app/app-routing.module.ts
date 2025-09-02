import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from './auth/registration/registration.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';

const routes: Routes = [
    { path: '', component: HomeComponent }, // početna stranica
    { path: 'register', component: RegistrationComponent },
    { path: 'login', component: LoginComponent},
    { path: 'adminHome', component: AdminHomeComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
