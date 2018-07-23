export interface ProfileImageModel {
  profile_photo_id?: number;
  profile_photo_url?: string;
}

export interface ProfileModel extends ProfileImageModel {
  id?: any;
  phone: string;
  first_name?: string;
  last_name?: string;
  zip_code?: number;
  birthday?: string;
}
