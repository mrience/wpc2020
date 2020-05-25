import {authCfg, identityPoolId, credentialName, defaultRegion, myBucket, apiUrl} from './env'

AWS.config.region = defaultRegion;

import AWS from 'aws-sdk/global';

import S3 from 'aws-sdk/clients/s3';
import {AuthorizationService} from './security/authorization.service';
import {registerRequest, confirmRequest,  loginRequest} from './fixtures/login';

import './styles.scss';

const auth = new AuthorizationService(authCfg, AWS.config);


const greetUser = (username) => {
    const greetEl = document.querySelector('.greet');
    greetEl.textContent = `Hello ${username}`;
}

const registerButton = document.querySelector('.registerUser');
registerButton.addEventListener('click', () => {
    console.log(`User ${registerRequest.email} is going to be registered`);
    auth.registerUser(registerRequest)
        .then(result => console.log('All is fine, user registered'))
        .catch(err => console.log('Sth is not YESS' + err.message))
})

const confirmButton = document.querySelector('.confirmUser');
confirmButton.addEventListener('click', () => {
    console.log(`User ${confirmRequest.username} is going to be confirmed`);
    auth.confirmAccount(confirmRequest)
        .then(result => console.log('All is fine, user registered'))
        .catch(err => console.log('Sth is not YESS' + err.message))
})

const loginButton = document.querySelector('.loginUser');
loginButton.addEventListener('click', () => {
    auth.login(loginRequest)
        .then(result => auth.refreshSession())
        .then(user => greetUser(user.nickname))
        .catch(err => console.log('access deny' + err.message))
});

//refreshSessionBasedOnAuthorization Token
(() => {
    auth.refreshSession()
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
};

//Use credentials to list bucket items
const listItemsInBucketButton = document.querySelector('.listItems');
listItemsInBucketButton.addEventListener('click', () => {
   listFilesInBucket();
  console.log('my all file');
});

const uploadInput = document.querySelector('.upload__input');
const uploadBtn = document.querySelector('.upload__confirm');
const uploadedFilesListEl = document.querySelector('.uploadedFilesList');

const httpUploadProgressHandler = (progress) => {
    const progressBarEl = document.querySelector('.progress__bar');
    const value = Math.round((progress.loaded / progress.total) * 100);
    progressBarEl.style.width = `${value}%`;
    progressBarEl.textContent = `${value} %`;
}
const consoleLogProgerssHandler = (progress) => console.log(process);

const uploadToS3 = (file, progressHandler) => {
    const userId = AWS.config.credentials.identityId;
    const params = {
        Body: file,
        Bucket: myBucket,
        Key: `uek-krakow/${userId}/photos/${file.name}`
    }
    
    return new Promise((res, fail) => {
        const s3 = new S3();
        s3.putObject(params, (err, data) => {
            if (err) {
                fail(err);
            }
            
            res(params.Key);
        }).on('httpUploadProgress', progressHandler);
    })
}
const getSignedURL = (key) => {
    const s3 = new S3();
    const params = {Bucket: myBucket, Key: key};
    return s3.getSignedUrl('getObject', params);
}
const createHtmlElFromString = (elementString) => {
    let parent = document.createElement('div');
    parent.innerHTML = elementString.trim();
    
    return parent.firstChild;
}
const addToUploadedFilesList = (url) => {
    const image = `
        <li>
            <img height="128" src="${url}"/>
        </li>
    `;
    uploadedFilesListEl.appendChild(createHtmlElFromString(image));
} 

let photosToBeTransformed = [];

uploadBtn.addEventListener('click', () => {
    if (!uploadInput.files.length > 0) {
        return;
    }
    
    const toBeUploadeFiles = [...uploadInput.files]
    toBeUploadeFiles.forEach((file, i) => {
        uploadToS3(file, httpUploadProgressHandler)
            .then(key => {
                photosToBeTransformed = [...photosToBeTransformed, key];
                return key;
            })
            .then(res => getSignedURL(res))
            .then(url => addToUploadedFilesList(url))
            .finally(() => uploadInput.value = "")
            .catch(err => console.log(err))
    })
})


const orderAnimation = (photos, email) => {
    return auth.getAccessToken()
        .then(token => {
            return fetch(`${apiUrl}/orders-2`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({
                    "photos": photos,
                    "email": email
                })
            })
        })
};

const orderAnimationBtn = document.querySelector('.orderAnimation');
orderAnimationBtn.addEventListener('click', () => {
    auth.refreshSession()
        .then(user => orderAnimation(photosToBeTransformed, user.email))
        .then(res => {
            console.log('Hurra it works')
            console.log(res)
        })
        .catch(e => console.log(e))
});