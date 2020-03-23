import {authCfg} from './env'
import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails
} from 'amazon-cognito-identity-js'

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
                onSuccess: (result) => resolve(result),
                onFailure: (err) => onError(err)
            }
        )
    });
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
        .then(result => console.log(result))
        .catch(err => console.log('access deny' + err.message))
})