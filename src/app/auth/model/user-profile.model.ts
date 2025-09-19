export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  biography: string;
  motto: string;
}

export interface UpdateProfileRequest {
  username: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  biography: string;
  motto: string;
}

export interface UpdateProfileResponse {
  message: string;
  success: boolean;
}