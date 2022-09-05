import React, { useEffect, useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
//import { createPeople, updatePeople, deletePeople } from './graphql/mutations';
import { listPeople, listBooking } from '../graphql/queries';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Alert } from '@mui/material';


function MainTable({isAuthenticated, setBookingList, searchTxt, setAlertMessages, prepareUserAuthInfo}) {
    const [bookingTable, setbookingTable] = useState([])


    useEffect(() => {
      prepareUserAuthInfo()
      //console.log(setBookingList)
      //if(isAuthenticated){
        fetchBookingTime();
      //}
    }, [searchTxt]);

    
    const fetchPeople = async (bookingList) => {
      let table_stack = ''
        try {
            const peopleData = await API.graphql({query:listPeople,  authMode: isAuthenticated ? "AMAZON_COGNITO_USER_POOLS" : "AWS_IAM"});
            const peopleList = peopleData.data.listPeople.items;

            bookingList.map((bookingInfo) => (
              table_stack= buildBookingTables( table_stack, peopleList, bookingInfo)
            ))
            setbookingTable(table_stack)
            setBookingList(bookingList)

        } catch (error) {
          const err = `error on fetchPeople: ${error}`
          console.log(error)
          setAlertMessages(<Alert severity="error">{err}</Alert>)
        }
    }

    const fetchBookingTime = async () => {
        try {
            const bookingData = await API.graphql({query:listBooking,  authMode: isAuthenticated ? "AMAZON_COGNITO_USER_POOLS" : "AWS_IAM"});
            const bookingListTmp = bookingData.data.listBooking.items;
            
            fetchPeople(bookingListTmp)
        } catch (error) {
          const err = `error on fetchBookingTime: ${error}`
          console.log(error)
          //setAlertMessages(<Alert severity="error">{err}</Alert>)
        }
    }    


    function buildBookingTables(table_stack,  peopleList, bookingInfo){
      try {
        let filteredPerson = peopleList.filter(person => person.book === bookingInfo.id)
        if(filteredPerson.length !== 0){     
          table_stack = createBookingTable(table_stack,bookingInfo, filteredPerson)
          
        }else{
          table_stack = createBookingTable(table_stack,bookingInfo, null)
        }
      } catch (error) {
          const err = `error on buildBookingTables: ${error}`
          console.log(error)
          setAlertMessages(<Alert severity="error">{err}</Alert>)
      }
      return table_stack
      
    }

    function createBookingTable(old, bookingInfo, people){
      //console.log(people)
        return(<div className="bookingTable">
            {old}
            <h3>Booking time: {bookingInfo.id}</h3>available seats: <b>{bookingInfo.available_seats_per_table}</b>, max number of seats: <b>{bookingInfo.max_seats}</b>
            <TableContainer component={Paper}>
            <Table sx={{ minWidth: 450 }} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">dish</TableCell>
                  <TableCell align="right">drink</TableCell>
                  <TableCell align="right">book</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {people && people.length >0 ? (
                  people.map( (person) => (
                    <TableRow
                      key={person.name}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {person.name}
                      </TableCell>
                      <TableCell align="right">{person.dish}</TableCell>
                      <TableCell align="right">{person.drink}</TableCell>
                      <TableCell align="right">{person.book}</TableCell>
                    </TableRow>
                  ))
                ) : (<TableRow
                  key={""}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >

                </TableRow>)}
              </TableBody>
            </Table>
          </TableContainer>
          </div>)
    }


    return (
        <div className="tableChild">
          {bookingTable}
          <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
        </div>
    )
}


export default MainTable;