import React, { useContext, useEffect } from 'react';
import { useNavigate, Form, Link, useActionData } from 'react-router-dom';
import { userContext, pageContext } from '../../context';

const LoginPage = () => {
	const navigate = useNavigate();
  const { user, setUser } = useContext(userContext);
  const { lastPage } = useContext(pageContext);
	const data = useActionData();
  
  // Set lastPage to variable that will prevent automatic page jump if page has just loaded
  useEffect(() => {
    lastPage.current = 'JustLoadedLogin'
  }, [])

  useEffect(() => {
    // Make sure the user has been set and they didn't just get to this page before navigating to UserHomePage
    if (user !== null && lastPage.current === '/') {
      return navigate('/UserHomePage');
    }
  }, [user]);

  // After a user submits info and a valid response from the backend has been received, 
  // this useEffect will set the user accordingly and update lastPage to a value that allows navigation away from login
  useEffect(() => {
		if (data?.user !== undefined) {
      setUser(data.user);
      // Update lastPage to this page on successful submission
      lastPage.current = '/';
		}
  }, [data]);

	return (
		<div className='login-container'>
			<h1>WELCOME TO ASSEMBLE</h1>
			<h2>Please Log In</h2>
			<br></br>
			<Form method='post' action='/' className='login-form'>
				<label>
					<span>Username</span>
					<input type='username' name='username' required />
				</label>
				<br></br>
				<label>
					<span>Password</span>
					<input type='password' name='password' required />
				</label>
				{data && data.error && <p>{data.error}</p>}
				<br></br>
				<button>Login</button>
			</Form>
			<div id='noAccount'>
				<br></br>
				<p>No account?</p>
				<Link to='/SignUpPage'> Sign up!</Link>
			</div>
		</div>
	);
};

// This action function is called when the Form above is submitted (see router setup in App.jsx).
export const loginAction = async ({ request }) => {
  // Data from the form submission is available via the following function
	const loginInfo = await request.formData();
  // On form submit, we need to send a post request to the backend with the proposed username and password
	const res = await fetch('/api/user/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			username: loginInfo.get('username'),
			password: loginInfo.get('password'),
		}),
	});

  // If the request repsonse has status 200, convert the response back to JS from JSON and proceed 
  if (res.status === 200) {
    const response = await res.json();
    
		if (response.status === 'valid') {
			// console.log('Login was successful!');
			return { user: response.user };
		}

    // We don't want the user to see why it failed, but dev's should be able to distinguish which is which
		if (response.status === 'IncorrectPassword' || response.status === 'UserNotFound') {
			return { error: 'Username password combination was not valid' };
    }
    
    // Included for dev testing, only appears if response.status string in the frontend and backend are misaligned 
		return { error: `The status "${response.status}" sent in the response doesn't match the valid cases.` };
  }
  // If the response wasn't 200, let the user know they need to try again later
  return { error: 'The server was unresponsive. Please try again later'};
};

export default LoginPage;
