import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { AdminProducts } from './admin-products/admin-products';
import { AdminCustomers } from './admin-customers/admin-customers';
import { AdminOrderDetail } from './admin-order-detail/admin-order-detail';
import { AdminOrders } from './admin-orders/admin-orders';

const routes: Routes = [
  { path: '', component: AdminDashboard },
  { path: 'products', component: AdminProducts },
  { path: 'customers', component: AdminCustomers },
  { path: 'orders', component: AdminOrders },
  { path: 'orders/:id', component: AdminOrderDetail }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}