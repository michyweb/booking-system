/* Amplify Params - DO NOT EDIT
	API_MYAPP_BOOKINGTABLE_ARN
	API_MYAPP_BOOKINGTABLE_NAME
	API_MYAPP_GRAPHQLAPIIDOUTPUT
	API_MYAPP_PEOPLETABLE_ARN
	API_MYAPP_PEOPLETABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const API_MYAPP_GRAPHQLAPIIDOUTPUT = process.env.API_MYAPP_GRAPHQLAPIIDOUTPUT;
const API_MYAPP_PEOPLETABLE_ARN = process.env.API_MYAPP_PEOPLETABLE_ARN;
const API_MYAPP_PEOPLETABLE_NAME = process.env.API_MYAPP_PEOPLETABLE_NAME;
const API_MYAPP_BOOKINGTABLE_ARN = process.env.API_MYAPP_BOOKINGTABLE_ARN;
const API_MYAPP_BOOKINGTABLE_NAME = process.env.API_MYAPP_BOOKINGTABLE_NAME

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();


async function getPeople(userID){
    const params = {
        TableName : API_MYAPP_PEOPLETABLE_NAME,
        Key: {
          id: userID
        }
    };    
    
    try {
        const personEntry = await docClient.get(params).promise()
        if(Object.keys(personEntry).length !== 0)
            return personEntry
        else 
            return null

      
    } catch (err) {
        console.log(err)
        return err
    }
    
}

async function personIsAdmin(userID){
    try {
        const personEntry = await getPeople(userID);
                
        if(personEntry && 'admin' in personEntry['Item'] && personEntry['Item']['admin'] === true){
            console.log("Person ", userID, " is admin: ", personEntry['Item']['admin'])
            return true
        }else{
            return false
        }
    } catch (err) {
        console.log(err)
    }
}


async function createBooking(event){
    const bookingEntry = {
        TableName : API_MYAPP_BOOKINGTABLE_NAME,
        Item: {
            id: event["arguments"]["input"]["id"],
            available_seats_per_table: event["arguments"]["input"]["max_seats"],
            max_seats: event["arguments"]["input"]["max_seats"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        // ,ConditionExpression: 'attribute_not_exists(id)'
    }
    try {
        
        await docClient.put(bookingEntry).promise();
    } catch (err) {
        console.log(err)
        return err;
    }
}

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    let userID = null
    
    try{
        // event["identity"]["claims"]["cognito:username"],
        if ("email" in event["identity"]["claims"] ){
            console.log(event["identity"]["claims"]["email"])
            userID = event["identity"]["claims"]["email"]
        }else{
            console.log(event["identity"]["username"])
            userID = event["identity"]["username"]
        }
    
        if (await personIsAdmin(userID)){
            const result = await createBooking(event)
            console.log(result)
            return { body: 'Successfully created item!' }
        }else{
        
            return { statusCode: 403, body: 'The user doesn\'t have the right permission' }
        }
        
    } catch (err) {
        return { error: err, error_message: err.message, error_name: err.name }
    }
    
    //return {
    //    statusCode: 200,
    //  Uncomment below to enable CORS requests
    //  headers: {
    //      "Access-Control-Allow-Origin": "*",
    //      "Access-Control-Allow-Headers": "*"
    //  }, 
    //    body: JSON.stringify('Hello from Lambda!'),
    //};
};


// createBooking