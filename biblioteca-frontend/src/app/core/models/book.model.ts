import { Author } from './author.model';
import { Category } from './category.model';

export interface Book {
  id: number;
  title: string;
  isbn?: string;
  publishedYear?: number;
  synopsis?: string;
  availableCopies: number;
  category?: Category;
  authors?: Author[];
}

export interface BookRequest {
  title: string;
  isbn?: string;
  publishedYear?: number;
  synopsis?: string;
  availableCopies: number;
  categoryId?: number;
  authorIds?: number[];
}
