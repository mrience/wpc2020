import {authCfg, identityPoolId, credentialName, defaultRegion, myBucket} from './env'
import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails,
} from 'amazon-cognito-identity-js'

AWS.config.region = defaultRegion;

import AWS from 'aws-sdk/global';
import {CognitoIdentityCredentials} from 'aws-sdk/global';
import S3 from 'aws-sdk/clients/s3';

const userPool = new CognitoUserPool({
    UserPoolId: authCfg.userPoolId,
    ClientId: authCfg.clientId
})

const registerRequest = {
    email: 'fnc86318@bcaoo.com',
    password: '1234qwer'
}

const registerUser = (registerData) => {
    return new Promise((resolve, onError) => {
        userPool.signUp(
            registerData.email,
            registerData.password,
            [
                new CognitoUserAttribute({
                    'Name': 'website',
                    'Value': 'jkan.pl'
                }),
                new CognitoUserAttribute({
                    'Name': 'nickname',
                    'Value': 'kubus'
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

const confirmRequest = {
    username: registerRequest.email,
    confirmationCode: '151678'
}

const confirmAccount = (confirmRequest) => {
    return new Promise((resolve, onError) => {
        const cognitoUser = new CognitoUser({
            Username: confirmRequest.username,
            Pool: userPool
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

const loginRequest = {
    username: registerRequest.email,
    password: registerRequest.password
}

const login = (loginRequest) => {
    return new Promise((resolve, onError) => {
        const cognitoUser = new CognitoUser({
            Username: loginRequest.username,
            Pool: userPool
        })
    
        cognitoUser.authenticateUser(
            new AuthenticationDetails({
                Username: loginRequest.username,
                Password: loginRequest.password
            }),
            {
                onSuccess: (result) => {
                    AWS.config.credentials = new CognitoIdentityCredentials({
                        IdentityPoolId: identityPoolId,
                        Logins: {
                            [credentialName]: result.getIdToken().getJwtToken()
                        }
                    });
                    
                    AWS.config.credentials.refresh((error) => {
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

const greetUser = (username) => {
    const greetEl = document.querySelector('.greet');
    greetEl.textContent = `Hello ${username}`;
}

const refreshSession = () => {
    return new Promise((res, error) => {
        const cognitoUser = userPool.getCurrentUser();
        
        if (cognitoUser == null) {
            error('user not authorized')
        }
        
        cognitoUser.getSession((err, result) => {
            if (err) {
                error(err);
            }
            
            AWS.config.credentials = new CognitoIdentityCredentials({
                IdentityPoolId: identityPoolId,
                Logins: {
                    [credentialName]: result.getIdToken().getJwtToken()
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


const registerButton = document.querySelector('.registerUser');
registerButton.addEventListener('click', () => {
    console.log(`User ${registerRequest.email} is going to be registered`);
    
    registerUser(registerRequest)
        .then(result => console.log('All is fine, user registered'))
        .catch(err => console.log('Sth is not YESS' + err.message))
})

const confirmButton = document.querySelector('.confirmUser');
confirmButton.addEventListener('click', () => {
    console.log(`User ${confirmRequest.username} is going to be confirmed`);
    confirmAccount(confirmRequest)
        .then(result => console.log('All is fine, user registered'))
        .catch(err => console.log('Sth is not YESS' + err.message))
})

const loginButton = document.querySelector('.loginUser');
loginButton.addEventListener('click', () => {
    login(loginRequest)
        .then(result => refreshSession())
        .then(user => greetUser(user.nickname))
        .catch(err => console.log('access deny' + err.message))
});

//refreshSessionBasedOnAuthorization Token
(() => {
    refreshSession()
        .then(user => greetUser(user.nickname))
        .catch(err => greetUser(`guest`))
    ;
})();





const listFilesInBucket = () => {
    const s3 = new S3();
    const params = {
        Bucket: myBucket,
        MaxKeys: 100
    }
    
    s3.listObjects(params, (err, data) => {
        if (err) {
            console.log(err);
        }
        
        console.log(data);
    })
}


//Use credentials to list bucket items
const listItemsInBucketButton = document.querySelector('.listItems');
listItemsInBucketButton.addEventListener('click', () => {
   listFilesInBucket(); 
});

//upload files to own directory
