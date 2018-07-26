export interface ProfileImageModel {
  profile_photo_id?: number;
  profile_photo_url?: string;
}

export interface ProfileModel extends ProfileImageModel {
  phone?: string;
  first_name?: string;
  last_name?: string;
  zip_code?: number;
  email?: string;
}
