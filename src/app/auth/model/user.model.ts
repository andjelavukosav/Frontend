export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    isBlocked?: boolean;

    firstName?: string;
    lastName?: string;
    profileImage?: string; 
    biography?: string;
    motto?: string; 
}
  