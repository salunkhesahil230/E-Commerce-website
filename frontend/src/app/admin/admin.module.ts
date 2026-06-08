import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { AdminProducts } from './admin-products/admin-products';
import { AdminCustomers } from './admin-customers/admin-customers';
import { AdminOrders } from './admin-orders/admin-orders';
import { AdminOrderDetail } from './admin-order-detail/admin-order-detail';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule,
    AdminDashboard,
    AdminProducts,
    AdminCustomers,
    AdminOrders,
    AdminOrderDetail
  ]
})
export class AdminModule {}