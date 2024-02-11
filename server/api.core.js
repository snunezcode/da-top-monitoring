const { classEMRCluster } = require('./class.core.js');
const { classAWS } = require('./class.aws.js');
const AWSObject = new classAWS();

//-- Engine Objects
var emrObjectContainer = [];



const fs = require('fs');
const express = require("express");
const cors = require('cors');
const uuid = require('uuid');
var configData = JSON.parse(fs.readFileSync('./aws-exports.json'));

const app = express();
const port = configData.aws_api_port;

app.use(cors());
app.use(express.json())
                     

// API Protection
var cookieParser = require('cookie-parser')
var csrf = require('csurf')
var bodyParser = require('body-parser')
const csrfProtection = csrf({
  cookie: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(csrfProtection);


// Security Variables
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
var jwkToPem = require('jwk-to-pem');
var request = require('request');
var pems;
var issCognitoIdp = "https://cognito-idp." + configData.aws_region + ".amazonaws.com/" + configData.aws_cognito_user_pool_id;
var secretKey =  crypto.randomBytes(32).toString('hex')



//-- Scheduler
const schedule = require('node-schedule');
var scheduleObjects = [];


// Startup - Download PEMs Keys
gatherPemKeys(issCognitoIdp);


//--#################################################################################################### 
//   ---------------------------------------- SCHEDULER
//--#################################################################################################### 

/*
function scheduleJob5s(){
    
    var timestamp = new Date();
    console.log({ time : timestamp.toTimeString().split(' ')[0], message : "5s - Scheduler" });
    
    //-- EMR
    for (let engineId of Object.keys(emrObjectContainer)) {
            emrObjectContainer[engineId].refreshData();
    }
    
    
}

//scheduleObjects['5s'] = schedule.scheduleJob('* /5 * * * * *', function(){scheduleJob5s();});

*/


//--################################################################################################################
//--------------------------------------------  SECURITY 
//--################################################################################################################

//-- Generate new standard token
function generateToken(tokenData){
    const token = jwt.sign(tokenData, secretKey, { expiresIn: 60 * 60 * configData.aws_token_expiration });
    return token ;
};


//-- Verify standard token
const verifyToken = (token) => {

    try {
        const decoded = jwt.verify(token, secretKey);
        return {isValid : true, session_id: decoded.session_id};
    }
    catch (ex) { 
        return {isValid : false, session_id: ""};
    }

};

//-- Gather PEMs keys from Cognito
function gatherPemKeys(iss)
{

    if (!pems) {
        //Download the JWKs and save it as PEM
        return new Promise((resolve, reject) => {
                    request({
                       url: iss + '/.well-known/jwks.json',
                       json: true
                     }, function (error, response, body) {
                         
                        if (!error && response.statusCode === 200) {
                            pems = {};
                            var keys = body['keys'];
                            for(var i = 0; i < keys.length; i++) {
                                //Convert each key to PEM
                                var key_id = keys[i].kid;
                                var modulus = keys[i].n;
                                var exponent = keys[i].e;
                                var key_type = keys[i].kty;
                                var jwk = { kty: key_type, n: modulus, e: exponent};
                                var pem = jwkToPem(jwk);
                                pems[key_id] = pem;
                            }
                        } else {
                            //Unable to download JWKs, fail the call
                            console.log("error");
                        }
                        
                        resolve(body);
                        
                    });
        });
        
        } 
    
    
}


//-- Validate Cognito Token
function verifyTokenCognito(token) {

   try {
        //Fail if the token is not jwt
        var decodedJwt = jwt.decode(token, {complete: true});
        if (!decodedJwt) {
            console.log("Not a valid JWT token");
            return {isValid : false, session_id: ""};
        }
        
        
        if (decodedJwt.payload.iss != issCognitoIdp) {
            console.log("invalid issuer");
            return {isValid : false, session_id: ""};
        }
        
        //Reject the jwt if it's not an 'Access Token'
        if (decodedJwt.payload.token_use != 'access') {
            console.log("Not an access token");
            return {isValid : false, session_id: ""};
        }
    
        //Get the kid from the token and retrieve corresponding PEM
        var kid = decodedJwt.header.kid;
        var pem = pems[kid];
        if (!pem) {
            console.log('Invalid access token');
            return {isValid : false, session_id: ""};
        }

        const decoded = jwt.verify(token, pem, { issuer: issCognitoIdp });
        return {isValid : true, session_id: ""};
    }
    catch (ex) { 
        console.log("Unauthorized Token");
        return {isValid : false, session_id: ""};
    }
    
};





//--################################################################################################################
//--------------------------------------------  EMR 
//--################################################################################################################



//--++ EMR - EC2 : Open Connection - EMR Cluster
app.get("/api/aws/emr/cluster/open/connection", async (req, res) => {

    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
        
 
    var connectionId = "";
    
    
    
    const params = req.query;
    
    try {
        
            
            var engineType = params.engineType;        
            var objectId = engineType + ":" + params.clusterId;
            var newObject = false;
            var creationTime = new Date().toISOString();
            
            
            if (!(objectId in emrObjectContainer)) {
                console.log("Creating new object : " + objectId);
                connectionId = uuid.v4();
                emrObjectContainer[objectId] = new classEMRCluster({
                                                                    properties : 
                                                                                { 
                                                                                    name : params.clusterId, 
                                                                                    clusterId: params.clusterId, 
                                                                                    uid: objectId, 
                                                                                    engineType : engineType, 
                                                                                    status : "-", 
                                                                                    connectionId: connectionId, 
                                                                                    creationTime : creationTime, 
                                                                                    lastUpdate : "" 
                                                                                },
                                    
                                    }
                                );
                newObject = true;
            }
            else {
                console.log("Reusing object : " + objectId);
                connectionId = emrObjectContainer[objectId].objectProperties.connectionId;
                creationTime = emrObjectContainer[objectId].objectProperties.creationTime;
                
            }
            res.status(200).send({ data : "Connection request completed", newObject : newObject, connectionId : connectionId, creationTime :  creationTime });
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }

});


//--++ EMR - EC2 : Gather Stats
app.get("/api/aws/emr/cluster/gather/stats", async (req, res) => {

        // Token Validation
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid"});
        
        try
            {
                var params = req.query;
                var clusterData = await emrObjectContainer[params.engineType + ":" + params.clusterId].getClusterData();
                res.status(200).send({ ... clusterData });
                
        }
        catch(err){
                console.log(err);
        }
});


//--++ EMR - EC2 : Gather Step List
app.get("/api/aws/emr/cluster/gather/steps", async (req, res) => {

        // Token Validation
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid"});
        
        try
            {
                var params = req.query;
                
                const parameter = { 
                  ClusterId: params.clusterId,
                  StepStates: [params.state],
                };

                var clusterSteps = await emrObjectContainer[params.engineType + ":" + params.clusterId].getClusterSteps(parameter);
                res.status(200).send({ ... clusterSteps });
                
        }
        catch(err){
                console.log(err);
        }
});



//--++ EMR - EC2 : Gather node performance metrics
app.get("/api/aws/emr/cluster/gather/node/metrics", async (req, res) => {

        // Token Validation
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid"});
        
        try
            {
                var params = req.query;
                
                const parameter = { 
                  clusterId : params.clusterId,
                  instanceId : params.instanceId,
                };

                var metrics = await emrObjectContainer[params.engineType + ":" + params.clusterId].getNodeMetrics(parameter);
                res.status(200).send({ ... metrics });
                
        }
        catch(err){
                console.log(err);
        }
});

//--################################################################################################################
//--------------------------------------------  TIMESTREAM
//--################################################################################################################


//--++ API : TIMESTREAM :  Execute Query
app.get("/api/aws/timestream/execute/query", async (req, res) => {
    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
 
    const params = req.query;
    
    try {
    
            var records = await AWSObject.executeTSQuery({ query : params.sqlQuery });
            res.status(200).send({ records : records });
    }
    catch (err) {
        console.log(err);
        res.status(401).send("API Failed");
    }
    
});


//--################################################################################################################
//--------------------------------------------  API GENERAL 
//--################################################################################################################


//--++ API : GENERAL : Get EMR Clusters
app.get("/api/aws/emr/cluster/list", async (req, res) => {

    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
 
    const params = req.query;
   
    var parameter = {
        ClusterStates: [ 
            "STARTING","BOOTSTRAPPING","RUNNING","WAITING"
        ]
    };
    
    
    try {
        
        var data = await AWSObject.getEMRClusters(parameter);
        res.status(200).send({ csrfToken: req.csrfToken(), Clusters : data.Clusters})
        
    } catch(error) {
        console.log(error);
        res.status(401).send({ Clusters : []});
    }
    
});






//--################################################################################################################
//--------------------------------------------  APP GENERAL
//--################################################################################################################



app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});


