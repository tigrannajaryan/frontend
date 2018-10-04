export interface ClientModel {
  uuid: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  state?: string;
  photo?: string;
}

export type GetMyClientsResponse = ClientModel[];
