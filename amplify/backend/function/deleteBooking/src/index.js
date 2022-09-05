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

async function removeBookingEntry(bookTime){
    const params = {
        TableName : API_MYAPP_BOOKINGTABLE_NAME,
        Key: {
          id: bookTime
        }
    };    
    
    try {
        await docClient.delete(params).promise()
    } catch (err) {
        console.log("err")
        console.error(err.stack || err);
        return err
    }
    console.log(4)
}


async function getPerson(userID){
    const params = {
        TableName : API_MYAPP_PEOPLETABLE_NAME,
        Key: {
          id: userID
        }
    };    
    
    try {
        const personEntry = await docClient.get(params).promise()
        return personEntry
      
    } catch (err) {
        console.error(err.stack || err);
        return err
    }

}

async function getPeople(){
    const params = {
        TableName : API_MYAPP_PEOPLETABLE_NAME
    };      
    try {
        const people = await docClient.scan(params).promise()
        return people['Items']
      
    } catch (err) {
        console.error(err.stack || err);
        return err
    }

}

async function releasePersonBookingTime(person){
    
    
    const params = {
        TableName: API_MYAPP_PEOPLETABLE_NAME,
        Key: {
            id: person['id'],
        },
        UpdateExpression: "set book = :empty",
        ExpressionAttributeValues: {
            ":empty": '',
        }
    };
    
    try {
        await docClient.update(params).promise()
        
      
    } catch (err) {
        console.error(err.stack || err);
        return err
    }
}




/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    let userID = null
    try{
        if ("email" in event["identity"]["claims"] ){
            console.log(event["identity"]["claims"]["email"])
            userID = event["identity"]["claims"]["email"]
        }else{
            console.log(event["identity"]["username"])
            userID = event["identity"]["username"]
        }
        
        const person = await getPerson(userID)
        const isAdmin = (person['Item']['admin'] ? true : false)
        if(isAdmin){
            
            const bookTime = event["arguments"]["input"]["id"]
            // remove the entire item from the booking table 
            await removeBookingEntry(bookTime)
            
            const people = await getPeople()
            // release the people from that had chosen the select booking time
            const peopleToRelease = people.filter(person => person['book'] === bookTime)
            for(var key in peopleToRelease){
                await releasePersonBookingTime(peopleToRelease[key])
            }
            
            return { body: 'Successfully delete item!' }
        }else{
           return { statusCode: 403, body: 'The user doesn\'t have the right permission' }

        }
        
    } catch (err) {
        console.error(err.stack || err);
        return { error: err, error_message: err.message, error_name: err.name }
    }

};

// deleteBooking