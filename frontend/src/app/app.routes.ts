import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ProductDetail } from './pages/product-detail/product-detail';
import { Cart } from './pages/cart/cart';
import { Orders } from './pages/orders/orders';
import { OrderDetail } from './pages/order-detail/order-detail';
import { Profile } from './pages/profile/profile';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password';
import { SearchResults } from './pages/search-results/search-results';
import { NotFound } from './pages/not-found/not-found';
import { customerGuard } from './guards/customer-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'product/:id', component: ProductDetail },
    { path: 'search', component: SearchResults },
    {
        path: 'cart',
        component: Cart,
        canActivate: [customerGuard]
    },
    {
        path: 'orders',
        component: Orders,
        canActivate: [customerGuard]
    },
    {
        path: 'orders/:id',
        component: OrderDetail,
        canActivate: [customerGuard]
    },
    {
        path: 'profile',
        component: Profile,
        canActivate: [customerGuard]
    },
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
        canActivate: [adminGuard]
    },
    { path: '**', component: NotFound }
];