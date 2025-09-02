export interface Registration {
    username: string;
    password: string;
    email: string;
    role: 'tourist' | 'guide' | '';  // Role can be either 'tourist' or 'guide'
}