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


async function getBookingEntry(bookTime){
    const params = {
        TableName : API_MYAPP_BOOKINGTABLE_NAME,
        Key: {
          id: bookTime
        }
    };    
    
    try {
        const data = await docClient.get(params).promise()
        if(Object.keys(data).length !== 0)
            return data
        else 
            return null        

    } catch (err) {
        console.error(err.stack || err);
        return err
    }
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
        if(Object.keys(personEntry).length !== 0)
            return personEntry
        else 
            return null
      
    } catch (err) {
        console.error(err.stack || err);
        return err
    }

}

async function releaseSeatFromBookingTable(bookTime){

    var params = {
        TableName:API_MYAPP_BOOKINGTABLE_NAME,
        Key:{
            "id": bookTime
        },
        UpdateExpression: "set available_seats_per_table = available_seats_per_table + :number",
        ExpressionAttributeValues:{
            ":number":1
        },
        ConditionExpression: 'available_seats_per_table < max_seats',
        ReturnValues:"UPDATED_NEW"
    };

    try{
        await docClient.update(params).promise();
    
    } catch (err) {
        console.error(err.stack || err);
        return err;
    }
}


async function createPerson(bookTime, userID, event, isAdmin){
    const person = {
        TableName : API_MYAPP_PEOPLETABLE_NAME,
        Item: {
            id: userID,
            name: event["arguments"]["input"]["name"],
            number: ( event["arguments"]["input"]["number"] ) ? event["arguments"]["input"]["number"]: "",
            drink: ( event["arguments"]["input"]["drink"] )   ? event["arguments"]["input"]["drink"]: "",
            dish: ( event["arguments"]["input"]["dish"] )     ? event["arguments"]["input"]["dish"]: "",
            book: bookTime,
            admin: isAdmin,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        // ,ConditionExpression: 'attribute_not_exists(id)'
    }
    try {
        
        await docClient.put(person).promise();
    } catch (err) {
        console.error(err.stack || err);
        return err;
    }
}


async function bookSeatOnTable(bookTime){
    var params = {
        TableName:API_MYAPP_BOOKINGTABLE_NAME,
        Key:{
            "id": bookTime
        },
        UpdateExpression: "set available_seats_per_table = available_seats_per_table - :number",
        ExpressionAttributeValues:{
            ":number":1,
            ":zero":0
        },
        ConditionExpression: 'available_seats_per_table > :zero',
        ReturnValues:"UPDATED_NEW"
    };

    try{
        console.log(106)
        const bookingEntry = await docClient.update(params).promise()
        console.log("bookingEntry:",bookingEntry)
        if(Object.keys(bookingEntry).length !== 0)
            return true
        else 
            return false
        
    
    } catch (err) {
        console.error(err.stack || err);
        console.log(err)
        return err;
    }    
}

async function checkAvailableSeatOnTable_byTime(bookTime){
    let bookingEntry;
    let bookingEntriesdata
    // check the available seats
    try {

        bookingEntry = await getBookingEntry(bookTime);

    } catch (err) {
        console.log(err);
        throw err;
    }

    if(bookingEntry){
        if('available_seats_per_table' in bookingEntry['Item'] && bookingEntry['Item']['available_seats_per_table'] > 0){
        
            return true
        }
        
    }else{
        
        console.log('There is not available seats');
        throw new Error('There is not available seats');
    }
        
    
    return false
}


// async function removePerson(userID){
//     const params = {
//         TableName : API_MYAPP_PEOPLETABLE_NAME,
//         Key: {
//           id: userID
//         }
//     };    
    
//     try {
//         const data = await docClient.delete(params).promise()
//         return data
//     } catch (err) {
//         console.log(err)
//         return err
//     }    
    
// }

function thePersonIsBookingTheSameTime(event, personBookedTime){
    if(personBookedTime === event["arguments"]["input"]["book"])
        return true
    else
        return false
}


function getPersonBookTime(personEntry){
    if('book' in personEntry['Item'] && personEntry['Item']['book']){
        console.log("Person book time: ", personEntry['Item']['book'])
        return personEntry['Item']['book']
    }
    return null
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
    
        // was the person already sat?
        const person = await getPerson(userID)
        console.log(person)
        let isAdmin = false
        isAdmin = (person && 'admin' in person['Item'] && person['Item']['admin'] ? true : false)
        
        let requestedBookTime = event["arguments"]["input"]["book"]

        
        // check if the person chose booking time
        // else it means the person wants to be removed from the booking list.
        if ("book" in event["arguments"]["input"] && event["arguments"]["input"]["book"]) {
            
            let personBookedTime = null
            // check if there is available seat on table for the requested time
            if(await checkAvailableSeatOnTable_byTime(event["arguments"]["input"]["book"] )){
                console.log(12)
                
                
                let reserved = false;
                console.log(101)
                if(person){
                    personBookedTime = getPersonBookTime(person)
                    // this person has never booked
                    if(personBookedTime === null){
                        reserved = await bookSeatOnTable(event["arguments"]["input"]["book"])
                    }else if( !thePersonIsBookingTheSameTime(event, personBookedTime)){
                        reserved = await bookSeatOnTable(event["arguments"]["input"]["book"])

                    }else{
                       // else means, person is booking the same time, in this case just update the attrbs
                        await createPerson(requestedBookTime, userID, event, isAdmin)
                    }
                }else{
                    console.log(103)
                    reserved = await bookSeatOnTable(event["arguments"]["input"]["book"])
                    console.log("reserved:",reserved)
                }
                
                // if there are available seat and the person is booking a different Time... {} && bookingEntry['Attributes']['available_seats_per_table'] > 0
                // if the reservation was made in the booking Table...
                if( reserved ){
                    console.log(2)
                
                    // check if the person was already sat and avoid release the seat if the person is booking the same one
                    if(personBookedTime && !thePersonIsBookingTheSameTime(event, personBookedTime)){
                        await releaseSeatFromBookingTable(personBookedTime)
                        console.log(3)
                    }
                    console.log(4)
                    // last step is to remove the person seat from the table People, we just remplace the previous booktime with the new one
                    // we don't add this a validation to check if the person is choosing the same booktime as other information may be different, dish, drink...
                    console.log("create:", requestedBookTime)
                    await createPerson(requestedBookTime, userID, event, isAdmin)
                }else{
                    return { body: 'the reserve couldn\'t be made ' }
                }

            }else{
                // when there is NOT available seats
                personBookedTime = getPersonBookTime(person)
                // this person has booked before && is booking the same time (he/she just wants to update dish or drink but not change bookingTime)
                if(personBookedTime !== null && thePersonIsBookingTheSameTime(event, personBookedTime)){
                    // meaning the person just wants to update its attrbs
                    await createPerson(requestedBookTime, userID, event, isAdmin)
                }else{
                    // if the person has never booked before but the table is full
                    return {body: 'no available seats for this time'}
                }
            }
            
        }else{
            // when the person wants to be removed from the booking list.
            
            // was the person already sat?
            const personBookedTime = getPersonBookTime(person)
            if(personBookedTime){
                // release person booking time from Booking table
                await releaseSeatFromBookingTable(personBookedTime)
            }
            
            if(person['Item']['book']){
                // release person booking time from People table
                await createPerson("", userID, event, isAdmin)
                return { body: 'You\'ve released your reserved ' }
            }else{
                return { body: 'You don\'t have any reserve ' }
            }
        }
        
        
        
        return { body: 'Successfully created item!' }
    } catch (err) {
        console.error(err.stack || err);
        return { error: err, error_message: err.message, error_name: err.name }
    }
        
        


    // return {
    //     statusCode: 200,
    // //  Uncomment below to enable CORS requests
    // //  headers: {
    // //      "Access-Control-Allow-Origin": "*",
    // //      "Access-Control-Allow-Headers": "*"
    // //  }, 
    //     body: JSON.stringify('Hello from Lambda!'),
    // };
};


// createPeople