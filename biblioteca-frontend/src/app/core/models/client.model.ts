export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  registrationDate?: string;
}

export interface ClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}
