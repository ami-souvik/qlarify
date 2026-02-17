import { NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand, ResendConfirmationCodeCommand, AdminUpdateUserAttributesCommand, AdminGetUserCommand, ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";
import crypto from 'crypto';

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION
});

function calculateSecretHash(username: string, clientId: string, clientSecret: string) {
  return crypto.createHmac('sha256', clientSecret)
    .update(username + clientId)
    .digest('base64');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, username, password, code, firstName, lastName } = body;

    const cognitoUsername = username;
    
    // Calculate SecretHash if Client Secret is available
    const secretHash = process.env.COGNITO_CLIENT_SECRET && process.env.COGNITO_CLIENT_ID
        ? calculateSecretHash(cognitoUsername, process.env.COGNITO_CLIENT_ID, process.env.COGNITO_CLIENT_SECRET)
        : undefined;

    if (action === 'signup') {
      try {
        const command = new SignUpCommand({
          ClientId: process.env.COGNITO_CLIENT_ID,
          SecretHash: secretHash,
          Username: cognitoUsername,
          Password: password,
          UserAttributes: [
            { Name: "email", Value: email },
            { Name: "given_name", Value: firstName },
            { Name: "family_name", Value: lastName },
            { Name: "name", Value: `${firstName} ${lastName}` }
          ]
        });

        await client.send(command);
        return NextResponse.json({ message: "User signed up successfully. Please verify email.", step: 'verify' });
      } catch (error: any) {
        if (error.name === 'UsernameExistsException') {
            const userPoolId = process.env.COGNITO_USER_POOL_ID;
            
            if (userPoolId) {
                 try {
                     // Check user status first
                     const getUserCmd = new AdminGetUserCommand({
                         UserPoolId: userPoolId,
                         Username: cognitoUsername
                     });
                     const user = await client.send(getUserCmd);

                     if (user.UserStatus === 'UNCONFIRMED') {
                         // Update attributes (Email, Name)
                         const updateCmd = new AdminUpdateUserAttributesCommand({
                             UserPoolId: userPoolId,
                             Username: cognitoUsername,
                             UserAttributes: [
                                 { Name: "email", Value: email },
                                 { Name: "given_name", Value: firstName },
                                 { Name: "family_name", Value: lastName },
                                 { Name: "name", Value: `${firstName} ${lastName}` }
                             ]
                         });
                         await client.send(updateCmd);
                         
                         // Resend Code to the new email
                         const resendCommand = new ResendConfirmationCodeCommand({
                            ClientId: process.env.COGNITO_CLIENT_ID,
                            SecretHash: secretHash,
                            Username: cognitoUsername
                        });
                        await client.send(resendCommand);
                        
                        return NextResponse.json({ 
                            message: "Account details updated and verification code sent to new email.", 
                            step: 'verify' 
                        });
                     } else {
                         return NextResponse.json({ error: "User already exists. Please log in." }, { status: 400 });
                     }

                 } catch (adminErr) {
                     // Fallback to basic resend if Admin actions fail
                 }
            } else {
                // Cannot update attributes without UserPoolId
            }

            // Fallback: Check if we can resend code (implies unconfirmed)
            try {
                const resendCommand = new ResendConfirmationCodeCommand({
                    ClientId: process.env.COGNITO_CLIENT_ID,
                    SecretHash: secretHash,
                    Username: cognitoUsername
                });
                await client.send(resendCommand);
                return NextResponse.json({ message: "Account exists but is unconfirmed. A new verification code has been sent.", step: 'verify' });
            } catch (resendError: any) {
                 // If resend fails, user is likely already confirmed or other issue.
                 console.error("Resend Error:", resendError);
                 return NextResponse.json({ error: "User already exists. Please log in." }, { status: 400 });
            }
        }
        throw error;
      }

    } else if (action === 'verify') {
      const command = new ConfirmSignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        SecretHash: secretHash,
        Username: cognitoUsername,
        ConfirmationCode: code,
      });

      await client.send(command);
      return NextResponse.json({ message: "User verified successfully." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("SignUp Error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
