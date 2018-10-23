export interface FollowersModel {
  uuid: string;
  first_name: string;
  last_name: string;
  booking_count: number;
  photo_url?: string;
}

export interface FollowersResponse {
  followers: FollowersModel[];
}
