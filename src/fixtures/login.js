export const registerRequest = {
    email: 'fnc86318@bcaoo.com',
    password: '1234qwer'
}

export const confirmRequest = {
    username: registerRequest.email,
    confirmationCode: '151678'
}

export const loginRequest = {
    username: registerRequest.email,
    password: registerRequest.password
}
