global.fetch = require('node-fetch')
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
// const AWS = require('aws-sdk');
// const request = require('request');
// const jwkToPem = require('jwk-to-pem');
// const jwt = require('jsonwebtoken');

class Cogniter {

  constructor(userPoolId, clientId) {
    this._PID = userPoolId;
    this._CID = clientId;
    this._attributeList = [];
  }

  getCognitoPoolData() {
    return {
      UserPoolId: this._PID, // Cognito User Pool Id
      ClientId: this._CID // Client id
    }
  }

  getCognitoUserPool() {
    return new AmazonCognitoIdentity.CognitoUserPool(this.getCognitoPoolData())
  }

  // PROP VALUE
  getAttributeList() {
    return this._attributeList
  }

  setAttributeList(key, value) {
    this._attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: key,
      Value: value
    }))
  }

  setAttributeObject(contain) {
    for (const key in contain) {
      this._attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({
        Name: key,
        Value: contain[key]
      }))
    }
  }

  createUser(emailCredential, passwordCredential) {
    const userPool = this.getCognitoUserPool()
    let attributeList = this.getAttributeList()

    // console.log('ATTRIBUTELIST : ', attributeList)
    // console.log('USERPOOL      : ', userPool)
    //console.log('emailCredential    /',emailCredential)
    //console.log('passwordCredential /',passwordCredential)

    //process.exit()

    return new Promise(function (resolve, reject) {
      userPool.signUp(emailCredential, passwordCredential, attributeList, null, function (err, result) {
        if (err) {
          console.log(err);
          return reject(err);
        }
        let cognitoUser = result.user;
        console.log('result is : ' + result)
        console.log('user name is : ' + cognitoUser.getUsername())

        return resolve(result.user)
      });

    })

  }

  logIn(emailCredential, passwordCredential) {

    // Username: 'sampleEmail@gmail.com',
    // Password: 'SamplePassword123',

    let details = new AmazonCognitoIdentity.AuthenticationDetails({
      Username: emailCredential,
      Password: passwordCredential,
    })

    let user_data = {
      Username: emailCredential,
      Pool: this.getCognitoUserPool()
    }

    // let cognitoUser = new AmazonCognitoIdentity.CognitoUser(user_data);
    // cognitoUser.authenticateUser(details, {
    //     onSuccess: function (result) {
    //         console.log('success authentication...')
    //         console.log('access token + ' + result.getAccessToken().getJwtToken());
    //         console.log('id token + ' + result.getIdToken().getJwtToken());
    //         console.log('refresh token + ' + result.getRefreshToken().getToken());
    //     },
    //     onFailure: function(err) {
    //         console.log(err);
    //     },

    // })

    let cognitoUser = new AmazonCognitoIdentity.CognitoUser(user_data)

    return new Promise(function (resolve, reject) {

      cognitoUser.authenticateUser(details, {
        onSuccess: function (result) {

          let tokenset = {
            idtoken: result.getIdToken().getJwtToken(),
            accesstoken: result.getAccessToken().getJwtToken(),
            refreshtoken: result.getRefreshToken().getToken()
          }

          //DEBUG
          console.log('id token + ' + tokenset.idtoken);
          console.log('access token + ' + tokenset.accesstoken);
          console.log('refresh token + ' + tokenset.refreshtoken);

          return resolve(tokenset)
        },
        onFailure: function (err) {
          console.log(err);
          return reject(err)
        },

      })
    })

  }


  //---------------

}

module.exports = Cogniter;