import {authCfg} from './env'
import {CognitoUserPool, CognitoUserAttribute} from 'amazon-cognito-identity-js'

const userPool = new CognitoUserPool({
    UserPoolId: authCfg.userPoolId,
    ClientId: authCfg.clientId
})

const registerRequest = {
    email: 'jakub.kanclerz+wpc2020@gmail.com',
    password: '123qwe'
}

const registerUser = (registerData) => {
    userPool.signUp(
        registerData.email,
        registerData.password,
        [
            new CognitoUserAttribute({
                'Name': 'website',
                'Value': 'jkan.pl'
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

const registerButton = document.querySelector('.registerUser');
registerButton.addEventListener('click', () => {
    console.log(`User ${registerRequest.email} is going to be registered`);
    registerUser(registerRequest)
})