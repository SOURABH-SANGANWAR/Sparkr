import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
// Adding the new field to the User interface
  interface User extends DefaultUser {
    token: {
        access_token: string;
        expires_in: number;
        refresh_token: string;
        refresh_token_expires_in: number;
        type: string;
        scope: string;
        installation_id?: number;
    };
    github_username: string;
    github_id: number;
    github_url: string;
    _id: mongoose.Types.ObjectId;
  }

// Here I add the user object to the session object so I can access it easily.
  interface Session extends DefaultSession {
    user: User;
  }
}