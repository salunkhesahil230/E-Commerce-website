import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product';
import { ProductCardComponent } from '../../components/product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  products: any[] = [];
  featuredProducts: any[] = [];
  taxonomyTree: any[] = [];
  loading = true;
  currentPage = 1;
  totalPages = 1;
  total = 0;

  banners = [
    { title: 'Big Billion Days Sale', subtitle: 'Up to 80% off on Electronics', bg: '#2874f0', accent: '#ffe500' },
    { title: 'Fashion Week', subtitle: 'Flat 50% off on Clothing', bg: '#ff6161', accent: '#fff' },
    { title: 'Home Makeover', subtitle: 'Best deals on Furniture', bg: '#00b96b', accent: '#fff' },
  ];
  currentBanner = 0;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadTaxonomy();
    this.startBannerRotation();
  }

  loadProducts(page = 1) {
    this.loading = true;
    this.productService.getProducts(page, 12).subscribe({
      next: (res) => {
        this.products = res.products;
        this.featuredProducts = res.products.slice(0, 4);
        this.totalPages = res.totalPages;
        this.total = res.total;
        this.currentPage = page;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadTaxonomy() {
    this.productService.getTaxonomyTree().subscribe(tree => {
      this.taxonomyTree = tree;
    });
  }

  startBannerRotation() {
    setInterval(() => {
      this.currentBanner = (this.currentBanner + 1) % this.banners.length;
    }, 3000);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadProducts(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  browseType(typeId: number) {
    this.router.navigate(['/search'], { queryParams: { typeId } });
  }

  browseSubCategory(subCategoryId: number) {
    this.router.navigate(['/search'], { queryParams: { subCategoryId } });
  }
}