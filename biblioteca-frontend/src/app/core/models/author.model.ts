export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  nationality?: string;
  birthDate?: string;
}

export interface AuthorRequest {
  firstName: string;
  lastName: string;
  nationality?: string;
  birthDate?: string;
}
