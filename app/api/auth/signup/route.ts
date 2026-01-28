
import { NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand, ResendConfirmationCodeCommand, AdminUpdateUserAttributesCommand, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, username, password, code, firstName, lastName } = body;

    const cognitoUsername = username || email;

    if (action === 'signup') {
      try {
        const command = new SignUpCommand({
          ClientId: process.env.COGNITO_CLIENT_ID,
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
            console.log("Signup Debug - Existing User Detected. UserPoolId configured:", !!userPoolId);
            
            if (userPoolId) {
                 try {
                     // Check user status first
                     const getUserCmd = new AdminGetUserCommand({
                         UserPoolId: userPoolId,
                         Username: cognitoUsername
                     });
                     const user = await client.send(getUserCmd);
                     console.log("Signup Debug - Existing User Status:", user.UserStatus);

                     if (user.UserStatus === 'UNCONFIRMED') {
                         console.log("Signup Debug - Updating unconfirmed user attributes...");
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
                         console.log("Signup Debug - Attributes updated.");
                         
                         // Resend Code to the new email
                         const resendCommand = new ResendConfirmationCodeCommand({
                            ClientId: process.env.COGNITO_CLIENT_ID,
                            Username: cognitoUsername
                        });
                        await client.send(resendCommand);
                        
                        return NextResponse.json({ 
                            message: "Account details updated and verification code sent to new email.", 
                            step: 'verify' 
                        });
                     } else {
                         console.log("Signup Debug - User is not UNCONFIRMED.");
                         return NextResponse.json({ error: "User already exists. Please log in." }, { status: 400 });
                     }

                 } catch (adminErr) {
                     console.error("Signup Debug - Admin Action Failed:", adminErr);
                     // Fallback to basic resend if Admin actions fail
                 }
            } else {
                console.warn("Signup Debug - Missing COGNITO_USER_POOL_ID in env. Cannot update attributes.");
            }

            // Fallback: Check if we can resend code (implies unconfirmed)
            try {
                const resendCommand = new ResendConfirmationCodeCommand({
                    ClientId: process.env.COGNITO_CLIENT_ID,
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
