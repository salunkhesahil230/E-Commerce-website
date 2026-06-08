import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-customers.html',
  styleUrl: './admin-customers.css'
})
export class AdminCustomers implements OnInit {
  customers: any[] = [];
  loading = true;
  successMsg = '';
  errorMsg = '';

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading = true;
    this.adminService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  toggleLock(customer: any) {
    const action = customer.isLocked ? 'unlock' : 'lock';
    if (!confirm(`Are you sure you want to ${action} ${customer.name}?`)) return;

    this.adminService.lockCustomer(customer.id, !customer.isLocked).subscribe({
      next: () => {
        customer.isLocked = !customer.isLocked;
        this.successMsg = `Customer ${action}ed successfully`;
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to update customer';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    });
  }
}