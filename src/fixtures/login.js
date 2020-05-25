export const registerRequest = {
    email: 'lgu37330@eoopy.com',
    password: '1234abcd'
}

export const confirmRequest = {
    username: registerRequest.email,
    confirmationCode: '528785'
}

export const loginRequest = {
    username: registerRequest.email,
    password: registerRequest.password
}
