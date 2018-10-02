export interface ClientModel {
  uuid: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  state?: string;
  client_photo_url?: string;
}

export interface GetMyClientsResponse {
  clients: ClientModel[];
}
