import {authCfg} from './env'
import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser
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
                console.error(err);
            }
            
            console.log(result);
        }
    )
}

const confirmRequest = {
    username: registerRequest.email,
    confirmationCode: '151678'
}

const confirmAccount = (confirmRequest) => {
    const cognitoUser = new CognitoUser({
        Username: confirmRequest.username,
        Pool: userPool
    })
    
    cognitoUser.confirmRegistration(
        confirmRequest.confirmationCode,
        true,
        (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(result);
        }
    )
}

const registerButton = document.querySelector('.registerUser');
registerButton.addEventListener('click', () => {
    console.log(`User ${registerRequest.email} is going to be registered`);
    registerUser(registerRequest)
})

const confirmButton = document.querySelector('.confirmUser');
confirmButton.addEventListener('click', () => {
    console.log(`User ${confirmRequest.username} is going to be confirmed`);
    confirmAccount(confirmRequest);
})