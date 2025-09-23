import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from './auth/registration/registration.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { UserBlogsComponent } from './blog/components/user-blogs/user-blogs.component';
import { BlogDetailsComponent } from './blog/components/blog-details/blog-details.component';
import { CreateTourComponent } from './tour/create-tour/create-tour.component';
import { DetailsTourComponent } from './tour/details-tour/details-tour.component';
import { PositionSimulatorComponent } from './position-simulator/position-simulator.component';
import { PublishTourComponent } from './tour/publish-tour/publish-tour.component';
import { ShoppingCartComponent } from './tour/shopping-cart/shopping-cart.component';
import { PurchasedToursComponent } from './tour/purchased-tours/purchased-tours.component';


const routes: Routes = [
    { path: '', component: HomeComponent }, // početna stranica
    { path: 'register', component: RegistrationComponent },
    { path: 'login', component: LoginComponent},
    { path: 'adminHome', component: AdminHomeComponent},
    { path: 'blogs', component: UserBlogsComponent},
    { path: 'blogs/:id', component: BlogDetailsComponent },
    { path: 'create-tour', component: CreateTourComponent},
    { path: 'tours', component: DetailsTourComponent},
    { path: 'position-simulator', component: PositionSimulatorComponent},
    { path: 'publish-tour', component: PublishTourComponent},
    { path: 'shopping-cart', component:ShoppingCartComponent},
    { path: 'purchased-tours', component: PurchasedToursComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
