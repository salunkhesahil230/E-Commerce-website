import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product';
import { ProductCardComponent } from '../../components/product-card/product-card';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './search-results.html',
  styleUrl: './search-results.css'
})
export class SearchResults implements OnInit {
  products: any[] = [];
  loading = true;
  total = 0;
  currentPage = 1;
  totalPages = 1;

  // Filters
  keyword = '';
  typeId = '';
  categoryId = '';
  subCategoryId = '';
  minPrice = '';
  maxPrice = '';
  inStock = false;

  // Taxonomy
  types: any[] = [];
  categories: any[] = [];
  subCategories: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) { }

  ngOnInit() {
    this.productService.getTypes().subscribe(types => {
      this.types = types;
    });

    this.route.queryParams.subscribe(params => {
      this.keyword = params['keyword'] || '';
      this.typeId = params['typeId'] || '';
      this.categoryId = params['categoryId'] || '';
      this.subCategoryId = params['subCategoryId'] || '';
      this.currentPage = parseInt(params['page']) || 1;
      this.loadResults();

      if (this.typeId) {
        this.productService.getCategories(parseInt(this.typeId)).subscribe(cats => {
          this.categories = cats;
        });
      }
      if (this.categoryId) {
        this.productService.getSubCategories(parseInt(this.categoryId)).subscribe(subs => {
          this.subCategories = subs;
        });
      }
    });
  }

  loadResults() {
    this.loading = true;
    const filters: any = {
      keyword: this.keyword,
      typeId: this.typeId,
      categoryId: this.categoryId,
      subCategoryId: this.subCategoryId,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      inStock: this.inStock ? 'true' : '',
      page: this.currentPage,
      limit: 12
    };

    this.productService.searchProducts(filters).subscribe({
      next: (res) => {
        this.products = res.products;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadResults();
  }

  clearFilters() {
    this.keyword = '';
    this.typeId = '';
    this.categoryId = '';
    this.subCategoryId = '';
    this.minPrice = '';
    this.maxPrice = '';
    this.inStock = false;
    this.categories = [];
    this.subCategories = [];
    this.currentPage = 1;
    this.loadResults();
  }

  onTypeChange() {
    this.categoryId = '';
    this.subCategoryId = '';
    this.categories = [];
    this.subCategories = [];
    if (this.typeId) {
      this.productService.getCategories(parseInt(this.typeId)).subscribe(cats => {
        this.categories = cats;
      });
    }
  }

  onCategoryChange() {
    this.subCategoryId = '';
    this.subCategories = [];
    if (this.categoryId) {
      this.productService.getSubCategories(parseInt(this.categoryId)).subscribe(subs => {
        this.subCategories = subs;
      });
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadResults();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}