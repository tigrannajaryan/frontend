export interface ClientModel {
  first_name?: string;
  last_name?: string;
  photo?: string;
}

export interface MyClientModel extends ClientModel {
  uuid: string;
  phone: string;
  city?: string;
  state?: string;
}

export interface GetNearbyClientsResponse {
  clients: ClientModel[];
}

export type GetMyClientsResponse = MyClientModel[];
