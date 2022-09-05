import React, { useEffect, useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
//import { createPeople, updatePeople, deletePeople } from './graphql/mutations';
import { createBooking, createPeople, deleteBooking } from '../graphql/mutations';
import { getPeople } from '../graphql/queries';
import { Button, TextField, Paper, MenuItem, Alert } from '@mui/material';



function BookingForm({user, isAuthenticated, bookingList, setSearchText, setAlertMessages}) {

    const [time, setTime] = useState("9pm");
    const onTimeChange = (e) => setTime(e.target.value);
    const [availableSeats, setAvailableSeats] = useState("");
    const onAvailableSeatsChange = (e) => setAvailableSeats(e.target.value);


    
    // const [id, setId] = useState("");
    // const onIdChange = (e) => setId(e.target.value);
    const [bookingTime, setBookTime] = useState("");
    const onBookChange = (e) => setBookTime(e.target.value); 

    const [dish, setDish] = useState("");
    const onDishChange = (e) => setDish(e.target.value);  
    const [drink, setDrink] = useState("");
    const onDrinkChange = (e) => setDrink(e.target.value); 
    const [name, setName] = useState("");
    const onNameChange = (e) => setName(e.target.value);  
    const [number, setNumber] = useState("");
    const onNumberChange = (e) => setNumber(e.target.value);              



    const [showAdmin, setShowAdmin] = useState(false)
    const [counter, setCounter] = useState(0)

    useEffect(() => {
        if(isAuthenticated)
            getPeopleById()
        
    },[])

    const removeReserve = async () => {
        try {
            const people_entry = {
                book: "",
                dish: "",
                drink: "",
                name: "",
                number: "" 
            };
            const peopleData = await API.graphql(graphqlOperation(createPeople, {input:people_entry}));
            const peopleResult = peopleData.data.createPeople;

            setAlertMessages(<Alert severity="success">Success on removing reserve!</Alert>)
            setCounter(counter + 1)
            setSearchText("updated_by_removeReserve_"+counter); 
            
        } catch (error) {
            const err = `error on removeReserve: ${error}`
            console.log(err)
            setAlertMessages(<Alert severity="error">{err}</Alert>)
        }
    }
 
    const addPeopleEntry = async () => {
        
        try {
            // id: id,
            const people_entry = {
                
                book: bookingTime,
                dish: dish,
                drink: drink,
                name: name,
                number: number 
            };
            // const bookingData = await API.graphql({query:createBooking, variables:{input:booking_entry}, authMode: "AWS_IAM"});
            const peopleData = await API.graphql(graphqlOperation(createPeople, {input:people_entry}));
            const peopleResult = peopleData.data.createPeople;
            //console.log('people entry', peopleResult);
            setAlertMessages(<Alert severity="success">Success on adding the people entry!</Alert>)
            setCounter(counter + 1)
            setSearchText("updated_by_addPeopleEntry_"+counter); 
            
            
        } catch (error) {
            const err = `error on addPeopleEntry: ${error}`
            console.log(err)
            setAlertMessages(<Alert severity="error">{err}</Alert>)
        }
    }    

    const getPeopleById = async () => {
        try{
            const people_entry = {
                id: user['username'] 
            };
            // const bookingData = await API.graphql({query:createBooking, variables:{input:booking_entry}, authMode: "AWS_IAM"});
            const peopleData = await API.graphql({query:getPeople, variables:people_entry, authMode: isAuthenticated ? "AMAZON_COGNITO_USER_POOLS" : "AWS_IAM"});
            const peopleResult = peopleData.data.getPeople;
            //console.log('booking entry', peopleResult);
            
            if(peopleResult.admin){
                setShowAdmin(true)
            }

            
        } catch (error) {
            const err = `error on getPeopleById: ${error}`
            console.log(err)
            //setAlertMessages(<Alert severity="error">{err}</Alert>)
        }
    }

    const addBookingEntry = async () => {
        try {
            const booking_entry = {
                id: time,
                available_seats_per_table: parseInt(availableSeats),
                max_seats: parseInt(availableSeats)    
            };
            // const bookingData = await API.graphql({query:createBooking, variables:{input:booking_entry}, authMode: "AWS_IAM"});
            const bookingData = await API.graphql(graphqlOperation(createBooking, {input:booking_entry}));
            const bookingResult = bookingData.data.createBooking;
            //console.log('booking entry', bookingResult);
            setAlertMessages(<Alert severity="success">Success on adding the booking entry!</Alert>)
            setCounter(counter + 1)
            setSearchText("updated_by_addBookingEntry_"+counter); 
            
        } catch (error) {
            const err = `error on addBookingEntry: ${error}`
            console.log(err)
            setAlertMessages(<Alert severity="error">{err}</Alert>)
        }
    }    

    const deleteBookingEntry = async () => {
        try {
            const booking_entry = {
                id: time,
                available_seats_per_table: 0,
                max_seats: 0   
            };

            const bookingData = await API.graphql(graphqlOperation(deleteBooking, {input:booking_entry}));
            const bookingResult = bookingData.data.createBooking;
            setAlertMessages(<Alert severity="success">Success on deleting the booking entry!</Alert>)
            setCounter(counter + 1)
            setSearchText("updated_by_deleteBookingEntry_"+counter); 
            
        } catch (error) {
            const err = `error on deleteBookingEntry: ${error}`
            console.log(err)
            setAlertMessages(<Alert severity="error">{err}</Alert>)
        }
    }


    return (
        <div className="tableChild">
             {/* <Button onClick={() => {console.log(bookingList)}}>Submit</Button>  */}
             
            
            {showAdmin ? (
                <Paper>

                    <h3>Admin form for creating new reservations</h3>

                    <TextField
                        onChange={onTimeChange}
                        value={time}
                        label={"Time: 9pm"} //optional
                        
                    /><br></br><br></br>
                    <TextField
                        onChange={onAvailableSeatsChange}
                        value={availableSeats}
                        label={"Available seats: 20"} //optional
                        
                    /><br></br>                                     

                    {/* <Button onClick={build_user_id}>Submit</Button> */}
                    <Button color='primary' onClick={() => addBookingEntry()}>Submit</Button><br></br>


                    <h3>Delete a reservation</h3>

                    <TextField
                        onChange={onTimeChange}
                        value={time}
                        label={"Time: 9pm"} //optional
                        
                    /><br></br>                                  
                    <Button color='primary' onClick={() => deleteBookingEntry()}>Delete</Button><br></br><br></br>
                </Paper>  
                          
            ):(<div></div>)}
            
            {typeof bookingList !== 'undefined' ? (
            <Paper>
                <h3>Sign up:</h3>

                <TextField
                    onChange={onNameChange}
                    value={name}
                    label={"Name: Goku"} //optional
                /><br></br><br></br>
                 <TextField
                    onChange={onNumberChange}
                    value={number}
                    label={"Telno: +34... Optional"} //optional
                /><br></br><br></br>
                 <TextField
                    onChange={onDrinkChange}
                    value={drink}
                    label={"Drink: Water"} //optional
                /><br></br><br></br>
                 <TextField
                    onChange={onDishChange}
                    value={dish}
                    label={"Dish: PokeBoom"} //optional
                /><br></br><br></br>
                <TextField
                id="outlined-select-currency"
                select
                label="Select"
                value={bookingTime}
                onChange={onBookChange}
                helperText="Please select your time"
                >
                {bookingList.map((option) => (
                    
                    <MenuItem key={option.id} value={option.id}>
                    {option.id}
                    </MenuItem>
                ))}
                
                </TextField> <br></br><br></br>                       

                <Button color='primary' onClick={() => addPeopleEntry()}>Submit</Button>
                <Button color='primary' onClick={() => removeReserve()}>Remove my reserve</Button>
                
            </Paper>
            ):(<div></div>)}
            


        </div>
    )
}


export default BookingForm;