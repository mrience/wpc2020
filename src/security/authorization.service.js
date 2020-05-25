import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails,
} from 'amazon-cognito-identity-js'
import {CognitoIdentityCredentials} from 'aws-sdk/global';

export class AuthorizationService {
    constructor(authCfg, awsConfig) {
        this.userPool = new CognitoUserPool({
            UserPoolId: authCfg.userPoolId,
            ClientId: authCfg.clientId
        })

        this.awsConfig = awsConfig;
        this.authCfg = authCfg;
    }
    
    registerUser(registerData) {
        return new Promise((resolve, onError) => {
            this.userPool.signUp(
                registerData.email,
                registerData.password,
                [
                    new CognitoUserAttribute({
                        'Name': 'website',
                        'Value': 'olaf.pl'
                    }),
                    new CognitoUserAttribute({
                        'Name': 'nickname',
                        'Value': 'Olaf'
                    })
                ],
                null,
                (err, result) => {
                    if (err) {
                        onError(err);
                    }
                    resolve(result);
                }
            )
    })
}

    confirmAccount(confirmRequest) {
        return new Promise((resolve, onError) => {
            const cognitoUser = new CognitoUser({
                Username: confirmRequest.username,
                Pool: this.userPool
            })
            
            cognitoUser.confirmRegistration(
                confirmRequest.confirmationCode,
                true,
                (err, result) => {
                    if (err) {
                        onError(err);
                        return;
                    }
                    resolve(result);
                }
            ) 
        });
    }
    
    login(loginRequest) {
        return new Promise((resolve, onError) => {
            const cognitoUser = new CognitoUser({
                Username: loginRequest.username,
                Pool: this.userPool
            })
        
            cognitoUser.authenticateUser(
                new AuthenticationDetails({
                    Username: loginRequest.username,
                    Password: loginRequest.password
                }),
                {
                    onSuccess: (result) => {
                        this.awsConfig.credentials = new CognitoIdentityCredentials({
                            IdentityPoolId: this.authCfg.identityPoolId,
                            Logins: {
                                [this.authCfg.credentialName]: result.getIdToken().getJwtToken()
                            }
                        });
                        
                        this.awsConfig.credentials.refresh((error) => {
                			if (error) {
                				console.error(error);
                			} else {
                				console.log('Successfully logged!');
                			}
            		    });
                        
                        resolve(result);
                    },
                    onFailure: (err) => onError(err)
                }
            )
        });
    }
    
    getAccessToken() {
        return new Promise((res, error) => {
            const cognitoUser = this.userPool.getCurrentUser();
            
            if (cognitoUser == null) {
                error('user not authorized')
            }
            
            cognitoUser.getSession((err, result) => {
                if (err) {
                    error(err);
                }
                
                res(result.getIdToken().getJwtToken());
            })
        })
    }
    
    refreshSession() {
        return new Promise((res, error) => {
            const cognitoUser = this.userPool.getCurrentUser();
            
            if (cognitoUser == null) {
                error('user not authorized')
            }
            
            cognitoUser.getSession((err, result) => {
                if (err) {
                    error(err);
                }
                
                this.awsConfig.credentials = new CognitoIdentityCredentials({
                    IdentityPoolId: this.authCfg.identityPoolId,
                    Logins: {
                        [this.authCfg.credentialName]: result.getIdToken().getJwtToken()
                    }
                });
                
                cognitoUser.getUserAttributes((err, attributes) => {
                    if (err) {
                        error(err);
                    }
    
                    res(attributes.reduce((profile, item) => {
                        return {...profile, [item.Name]: item.Value}
                    }, {}));
                })
            })
        })
    }
}