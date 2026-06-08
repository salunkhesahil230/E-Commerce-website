import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css'
})
export class AdminProducts implements OnInit {
  products: any[] = [];
  loading = true;
  total = 0;
  currentPage = 1;
  totalPages = 1;

  // Form
  showForm = false;
  editingProduct: any = null;
  formLoading = false;
  formError = '';
  formSuccess = '';

  // Form fields
  name = '';
  description = '';
  price = '';
  stock = '';
  subCategoryId = '';
  selectedFile: File | null = null;

  // Taxonomy
  types: any[] = [];
  categories: any[] = [];
  subCategories: any[] = [];
  selectedTypeId = '';
  selectedCategoryId = '';

  constructor(
    private adminService: AdminService,
    private productService: ProductService
  ) { }

  ngOnInit() {
    this.loadProducts();
    this.productService.getTypes().subscribe(types => {
      this.types = types;
    });
  }

  loadProducts(page = 1) {
    this.loading = true;
    this.adminService.getProducts(page).subscribe({
      next: (res) => {
        this.products = res.products;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.currentPage = page;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onTypeChange() {
    this.selectedCategoryId = '';
    this.subCategoryId = '';
    this.categories = [];
    this.subCategories = [];
    if (this.selectedTypeId) {
      this.productService.getCategories(parseInt(this.selectedTypeId)).subscribe(cats => {
        this.categories = cats;
      });
    }
  }

  onCategoryChange() {
    this.subCategoryId = '';
    this.subCategories = [];
    if (this.selectedCategoryId) {
      this.productService.getSubCategories(parseInt(this.selectedCategoryId)).subscribe(subs => {
        this.subCategories = subs;
      });
    }
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }

  openAddForm() {
    this.editingProduct = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(product: any) {
    this.editingProduct = product;
    this.name = product.name;
    this.description = product.description || '';
    this.price = product.price;
    this.stock = product.stock;
    this.subCategoryId = product.subCategory?.id || '';
    this.showForm = true;
    this.formError = '';
    this.formSuccess = '';
  }

  resetForm() {
    this.name = '';
    this.description = '';
    this.price = '';
    this.stock = '';
    this.subCategoryId = '';
    this.selectedFile = null;
    this.selectedTypeId = '';
    this.selectedCategoryId = '';
    this.categories = [];
    this.subCategories = [];
    this.formError = '';
    this.formSuccess = '';
  }

  saveProduct() {
    this.formError = '';
    if (!this.name || !this.price || !this.stock || !this.subCategoryId) {
      this.formError = 'Please fill all required fields';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('description', this.description);
    formData.append('price', this.price);
    formData.append('stock', this.stock);
    formData.append('subCategoryId', this.subCategoryId);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.formLoading = true;
    const request = this.editingProduct
      ? this.adminService.updateProduct(this.editingProduct.id, formData)
      : this.adminService.addProduct(formData);

    request.subscribe({
      next: () => {
        this.formLoading = false;
        this.formSuccess = this.editingProduct
          ? 'Product updated successfully!'
          : 'Product added successfully!';
        this.loadProducts(this.currentPage);
        setTimeout(() => {
          this.showForm = false;
          this.resetForm();
        }, 1500);
      },
      error: (err) => {
        this.formLoading = false;
        this.formError = err.error?.message || 'Failed to save product';
      }
    });
  }

  deleteProduct(id: number, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    this.adminService.deleteProduct(id).subscribe({
      next: () => this.loadProducts(this.currentPage),
      error: (err) => alert(err.error?.message || 'Failed to delete')
    });
  }

  getImageUrl(imagePath: string): string {
    if (imagePath) return `http://localhost:3000/ProductImages/${imagePath}`;
    return '/placeholder.png';
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadProducts(page);
    }
  }
}