
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Cognito",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const creds = credentials as Record<string, string>;
                const username = creds?.email || creds?.username;
                const password = creds?.password;

                if (!username || !password) {
                    console.error("Missing credentials. Received:", credentials);
                    return null;
                }

                const region = process.env.AWS_REGION;
                const clientId = process.env.COGNITO_CLIENT_ID;

                console.log("Auth Debug - Region:", region);
                console.log("Auth Debug - ClientID Present:", !!clientId);

                const client = new CognitoIdentityProviderClient({
                    region: region
                });

                try {
                    // Debug logs
                    console.log("Attempting Cognito Login for:", username);
                    if (!process.env.COGNITO_CLIENT_ID) console.error("Missing COGNITO_CLIENT_ID");
                    
                    const command = new InitiateAuthCommand({
                        AuthFlow: "USER_PASSWORD_AUTH",
                        ClientId: process.env.COGNITO_CLIENT_ID,
                        AuthParameters: {
                            USERNAME: username,
                            PASSWORD: password,
                        },
                    });

                    const response = await client.send(command);
                    console.log("Cognito Response:", JSON.stringify(response, null, 2));

                    if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
                        console.log("User requires new password. Attempting to set new password...");
                        const challengeCommand = new RespondToAuthChallengeCommand({
                            ChallengeName: "NEW_PASSWORD_REQUIRED",
                            ClientId: process.env.COGNITO_CLIENT_ID,
                            ChallengeResponses: {
                                USERNAME: username,
                                NEW_PASSWORD: password, // Setting the provided password as the permanent one
                                SECRET_HASH: process.env.COGNITO_CLIENT_SECRET ?? "",
                            },
                            Session: (response.Session as string),
                        });
                        
                        const challengeResponse = await client.send(challengeCommand);
                        console.log("Challenge Response:", JSON.stringify(challengeResponse, null, 2));

                        if (challengeResponse.AuthenticationResult) {
                             return {
                                id: username, 
                                email: username,
                                name: username.split('@')[0], 
                                accessToken: challengeResponse.AuthenticationResult.AccessToken, 
                             }
                        }
                    }

                    if (response.AuthenticationResult) {
                         return {
                            id: username, 
                            email: username,
                            name: username.split('@')[0], 
                            accessToken: response.AuthenticationResult.AccessToken, 
                         }
                    }
                    console.warn("Cognito Login successful but no AuthenticationResult. ChallengeName:", response.ChallengeName);
                    return null;
                } catch (error: any) {
                    console.error("Cognito Login Error Details:", JSON.stringify(error, null, 2));
                    
                    if (error.name === 'UserNotConfirmedException') {
                         throw new Error("Please verify your email before logging in.");
                    }
                    if (error.name === 'NotAuthorizedException') {
                         throw new Error("Invalid email or password.");
                    }
                    
                    throw new Error(error.message || "Login failed");
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
