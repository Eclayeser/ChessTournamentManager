// Import React lib and react-router-dom library components
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Modal from "./ModalTemplate";

// Functional component
function MyAccount() {

    //State variable to define presense state of Personal Details Pop-Up
    const [isModalOpenDetails, setIsModalOpenDetails] = useState(false);
    //On open user details pop-up
    const openModalDetails = () => {
        //display pop-up true
        setIsModalOpenDetails(true);
        //set user details to original values
        setEmail(emailOriginal);
        setSurname(surnameOriginal);
        setFirstName(firstNameOriginal);
        //empty error and success message
    };
    //On close user details pop-up
    const closeModalDetails = () => {
        //display pop-up false
        setIsModalOpenDetails(false);
        //empty error and success message
        setError("");
        setSuccessMessage("");
    };

    //State variable to define presense state of Password Change Pop-Up
    const [isModalOpenPassword, setIsModalOpenPassword] = useState(false);
    //On open password change pop-up
    const openModalPassword = () => {
        //display password change pop-up true, display user details pop-up false
        setIsModalOpenPassword(true);
        setIsModalOpenDetails(false);
        //empty password fields
        setPassword("");
        setNewPassword("");
        setNewReEnteredPassword("");
        //empty error and success message
        setError("");
        setSuccessMessage("");
    };
    //On close password change pop-up
    const closeModalPassword = () => {
        //display password change pop-up false, display user details pop-up true
        setIsModalOpenPassword(false);
        setIsModalOpenDetails(true);
        //empty password fields
        setError("");
        setSuccessMessage("");
    };

    //State variable to define presense state of Delete Confirmation Pop-Up
    const [isModalOpenDelConf, setIsModalOpenDelConf] = useState(false);
    //On open delete confirmation pop-up
    const openModalDelConf = () => {
        //display delete confirmation pop-up true
        setIsModalOpenDelConf(true);
    };
    //On close delete confirmation pop-up
    const closeModalDelConf = () => {
        //display delete confirmation pop-up false
        setIsModalOpenDelConf(false);
        //empty error message
        setError("");
    };


    //Variables
    //Used to hold new user input details
    const [email, setEmail] = useState("");
    const [surname, setSurname] = useState("");
    const [firstName, setFirstName] = useState("");
    //Used to hold user new password details
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newReEnteredPassword, setNewReEnteredPassword] = useState("");
    //Used to hold user original details fetched from server
    const [usernameOriginal, setUsernameOriginal] = useState("");
    const [emailOriginal, setEmailOriginal] = useState("");
    const [surnameOriginal, setSurnameOriginal] = useState("");
    const [firstNameOriginal, setfirstNameOriginal] = useState("");
    //Used to hold error and success messages
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    //react-router-dom hook
    const navigate = useNavigate();

    //Function to request user details from server
    const requestUserDetails = async () => {
        try {
            //send request to server
            const response = await fetch("http://localhost:5000/account", {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
            });
            //response from server
            const server_resObject = await response.json();
            // if successful -> reassign relevant states with user details
            if (server_resObject.success === true) {
                setUsernameOriginal(server_resObject.user.username);
                setEmailOriginal(server_resObject.user.email);
                setSurnameOriginal(server_resObject.user.surname);
                setfirstNameOriginal(server_resObject.user.firstname);
            // else
            } else {
                // if session expired -> remove sessionID, set global error and go to login page
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                // else -> set error message to display
                } else {
                    setError(server_resObject.message);
                };
            };
        //catch and log any errors
        } catch (err) {
            console.error(err.message);
        };
    };



    //Function to log out
    const logOut = async () => {
        try{
            //send request to server
            const response = await fetch("http://localhost:5000/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
            });
            //response from server
            const server_resObject = await response.json();
            // if successful -> remove sessionID and go to login page
            if (server_resObject.success === true) {
                localStorage.removeItem("sessionID");
                navigate("/login");
            // else (repeats from previous functions)
            } else {
                // if session expired -> remove sessionID, set global error and go to login page
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                // else -> log error
                } else {
                    console.error("Error logging out");
                };
            };
        //catch and log any errors
        } catch (err) {
            console.error(err.message);
        };
    };


    //Function to change user details
    const changePersonalDetails = async () => {
        //empty error and success message
        setError("");
        setSuccessMessage("");
        try {
            //object to be sent to server (email, surname, first name)
            const body = { email: email, surname: surname, firstName: firstName};
            //fetch request to server
            const response = await fetch("http://localhost:5000/update-user-details", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
                body: JSON.stringify(body)
            });
            //response from server
            const server_resObject = await response.json();
            // if successful -> set success message and request updated user details
            if (server_resObject.success === true) {
                setSuccessMessage(server_resObject.message);
                requestUserDetails();
            // else (repeats from previous function)
            } else {
                // if session expired -> remove sessionID, set global error and go to login page
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                // else -> set error message from server
                } else {
                    setError(server_resObject.message);
                };
            };
        //catch and log any errors
        } catch (err) {
            console.error(err.message);
        };
    };



    //Function to change user password
    const changePassword = async () => {
        //empty error and success message
        setError("");
        setSuccessMessage("");
        //check if new passwords match
        if (newPassword !== newReEnteredPassword) {
            setError("New passwords do not match");
            return;
        };
        try {
            //object to be sent to server (old password, new password)
            const body = { password: password, newPassword: newPassword};
            //send request to server
            const response = await fetch("http://localhost:5000/update-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
                body: JSON.stringify(body)
            });
            //response from server
            const server_resObject = await response.json();
            // if successful -> set success message and empty password fields
            if (server_resObject.success === true) {
                setSuccessMessage(server_resObject.message);
                setPassword("");
                setNewPassword("");
                setNewReEnteredPassword("");
            // else (repeats from previous function)
            } else {
                // if session expired -> remove sessionID, set global error and go to login page
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                // else -> set error message from server
                } else {
                    setError(server_resObject.message);
                };
            };
        //catch and log any errors
        } catch (err) {
            console.error(err.message);
        };
    };


    //Function to delete user account
    const deleteAccount = async () => {
        try {
            //send request to server
            const response = await fetch("http://localhost:5000/delete-user", {
                method: "DELETE",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
            });
            //response from server
            const server_resObject = await response.json();
            // if successful -> remove sessionID and go to login page
            if (server_resObject.success === true) {
                localStorage.removeItem("sessionID");
                navigate("/");
            // else (repeats from previous function)
            } else {
                // if session expired -> remove sessionID, set global error and go to login page
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                // else -> set error message from server
                } else {
                    setError(server_resObject.message);
                };
            };
        // catch and log any errors
        } catch (err) {
            console.error(err.message);
        };
    };



    //triggered when component is rendered
    useEffect(() => {
        // request user details
        requestUserDetails();
    }, []);
  
    //Display contents
     return (
        <div>
            {/* Display page title, username and email (using states), immutable*/}
            <h1>My Account</h1>
            <label>Username: <input type="text" value={usernameOriginal} readOnly /> </label>
            <label>Email: <input type="text" value={emailOriginal} readOnly /> </label>
            {/* Button to trigger ser-req funcs: log out */}
            <button onClick={logOut}>Log Out</button>
            <button onClick={openModalDetails}>Change Personal Details</button>
            <button onClick={openModalDelConf}>Delete Account</button>

            {/* Change Personal Details Pop-up */}
            {/*errorDisplay and successDisplay both use states*/}
            <Modal isOpen={isModalOpenDetails} onClose={closeModalDetails} title="Personal Details" errorDisplay={error} successDisplay={successMessage}>
                {/* Form to change personal details {child prop)*/}
                <form style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>First Name: <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /> </label>
                    <label>Surname: <input type="text" value={surname} onChange={(e) => setSurname(e.target.value)} required /> </label>
                    <label>Email: <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required /> </label>
                </form>
                {/* Buttons to open password window or save changes */}
                <button onClick={openModalPassword}>Change Password</button>
                <button onClick={changePersonalDetails}>Save Changes</button>    
            </Modal>

            {/* Change Password Pop-up */}
            {/*errorDisplay and successDisplay both use states*/}
            <Modal isOpen={isModalOpenPassword} onClose={closeModalPassword} title="Personal Details" errorDisplay={error} successDisplay={successMessage}>
                {/* Form to change password {child prop)*/}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Password: <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /> </label>
                    <label>New Password: <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required/> </label>
                    <label>Re-Enter Password: 
                        <input type="password" value={newReEnteredPassword} onChange={(e) => setNewReEnteredPassword(e.target.value)} required /> 
                    </label>
                </div>
                {/* Button to save new password */}
                <button onClick={changePassword}>Save New Password</button>    
            </Modal>

            {/* Delete Confirmation Pop-up */}
            <Modal isOpen={isModalOpenDelConf} onClose={closeModalDelConf} title="Delete Your Account" errorDisplay={error}>
                {/* Confirmation message and choice buttons {child prop}*/}
                <h3>Are you sure you want to delete your account?</h3>
                <p>All your tournaments will be permanently lost.</p>
                <button onClick={deleteAccount}>Confirm</button>
                <button onClick={closeModalDelConf}>Cancel</button>      
            </Modal>
        </div>
    );
};

//Export to be used by App.js
export default MyAccount;