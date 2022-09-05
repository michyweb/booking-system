import React, { useEffect, useState } from 'react';
import { Amplify, Auth, Hub, API, graphqlOperation  } from 'aws-amplify';
import MainTable from './table/MainTable';
import BookingForm from './table/BookingForm';
import { Card, Grid, Paper, Stack } from '@mui/material';


function App() {
 
  
  const [user, setUser] = useState(null);

  useEffect(() => {
    //prepareUserAuthInfo()
    Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
        case 'cognitoHostedUI':
          getUser().then(userData => setUser(userData));
          break;
        case 'signOut':
          setUser(null);
          break;
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          console.log('Sign in failure', data);
          break;
      }
    });
    
    getUser().then(userData => setUser(userData));
    
  }, []);

  function getUser() {
    return Auth.currentAuthenticatedUser()
      .then(userData => userData)
      .catch(() => console.log('Not signed in'));
  }





  const [bookingList, setBookingList] = useState()
  const [searchTxt, setSearchText] = useState('');
  const [alertMessages, setAlertMessages] = useState('');
  const [userAuthInfo, setUserAuthInfo] = useState('')
  
  function prepareUserAuthInfo(){
    if(user){
      let providerInfo = ('identities' in user.attributes && JSON.parse(user.attributes.identities)[0].providerName ? JSON.parse(user.attributes.identities)[0].providerName : null)
      if(providerInfo){
        setUserAuthInfo("Hello: " + user.attributes.email + ", provider: " +providerInfo)
      }else{
        setUserAuthInfo("Hello: " + user.attributes.email)
      }
    }
  }

  return (
    <div>
      <Paper>
      
        <div className="alertMessages">
          
            <Stack sx={{ width: '100%' }} spacing={2}>
              {alertMessages}
            </Stack>  
          
        </div>
        </Paper>
        {user ? (
          
          <div className="body">
            {/* <p>{user ? JSON.stringify(user) : ''}</p> */}
            <p>{userAuthInfo} <button onClick={() => Auth.signOut()}>Sign Out</button></p>
            

            <Grid container direction="column-reverse" justifyContent="center" alignItems="stretch">
              <Grid item xs>
              
                  <MainTable isAuthenticated={true} setBookingList={setBookingList} searchTxt={searchTxt} setAlertMessages={setAlertMessages} prepareUserAuthInfo={prepareUserAuthInfo}/>
              
              </Grid>
                <BookingForm user={user} isAuthenticated={true} bookingList={bookingList} setSearchText={setSearchText} setAlertMessages={setAlertMessages} />
              
            </Grid>
          </div>
        ) : (
          <div className="body">
            <button onClick={() => Auth.federatedSignIn()}>Federated Sign In</button>
            <MainTable isAuthenticated={false} setBookingList={setBookingList} searchTxt={searchTxt} setAlertMessages={setAlertMessages} prepareUserAuthInfo={prepareUserAuthInfo}/>
          </div>
          
        )}
      
    </div>
  );
}

export default App;