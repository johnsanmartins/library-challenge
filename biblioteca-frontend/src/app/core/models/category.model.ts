export interface Category {
  id: number;
  name: string;
  description?: string;
  bookCount?: number;
}

export interface CategoryRequest {
  name: string;
  description?: string;
}
