import { Book } from './book.model';
import { Client } from './client.model';

export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export interface Loan {
  id: number;
  book: Book;
  client: Client;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: LoanStatus;
}

export interface LoanRequest {
  bookId: number;
  clientId: number;
  dueDate: string;
  status?: LoanStatus;
}
