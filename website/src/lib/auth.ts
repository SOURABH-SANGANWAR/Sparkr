import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import GitHub from "next-auth/providers/github"
import clientPromise  from "@/lib/db"
import CredentialsProvider from "next-auth/providers/credentials";
import UserModel from "@/models/User";

async function generate_token(code: string) {
  if (! process.env.CLIENT_ID || ! process.env.CLIENT_SECRET) {
    return null
  }

  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  const response = await fetch(`https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`, {
    method: "POST",
    headers: {
      "Accept": "application/json"
    }
  });

  const data = await response.json();


  if (data.error) {
    return null
  }

  if (! data.access_token) {
    return null
  }

  return data;
}


async function fetch_github_user(token: string) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  // console.log("user data from github:", data);

  if (data.error) {
    return null
  }

  let user = {
    name: data.name,
    image: data.avatar_url,
    github_id: data.id,
    github_url : data.url,
    github_username: data.login,
    email: ""
  }

  const emails = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  // console.log("emails response:", emails);

  const email_data = await emails.json();
  if (email_data.error) {
    return null
  }


  user.email = email_data.find((email: { primary: boolean; }) => email.primary).email;

  // console.log("user data:", user);

  // await connectDB();

  const user_obj = await UserModel.find({github_url: data.url})

  // console.log("users found from db:", user_obj);

  if (user_obj && user_obj.length > 0) {
    // console.log("user from db:", user_obj[0]);
    return user_obj[0];
  }


  const new_user_obj = new UserModel(user);
  await new_user_obj.save();
  return new_user_obj;
}
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [GitHub, 
    CredentialsProvider(
      {
        name: "Github App",
        credentials: {
          code : {label: "Code", type: "text"}
        },

        async authorize(credentials) {
          // console.log("credentials recieved:", credentials);
          const token_data  = await generate_token(credentials.code as string); // Cast credentials.code to string
          if (! token_data) {
            return null
          }
          const user = await fetch_github_user(token_data.access_token);
          if (! user) {

            return null
          }
          let userJson = user.toJSON();

          userJson["token"] = token_data;
          // console.log("user from db:", userJson);
          return userJson;
        }
      })
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    jwt: async ({ token, user }) => {
      user && (token.user = user)
      return token
    },
    session: async ({ session, token }: { session: any, token: any }) => {
      session.user = token.user
      return session
    }
  }
})
