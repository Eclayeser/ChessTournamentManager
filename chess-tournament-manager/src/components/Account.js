// Import React lib and react-router-dom library components
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Modal from "./ModalTemplate";

// Functional component
function MyAccount() {

    //State variables and functions for Personal Details Pop-Up
    const [isModalOpenDetails, setIsModalOpenDetails] = useState(false);

    const openModalDetails = () => {
        setIsModalOpenDetails(true);

        setEmail(emailOriginal);
        setSurname(surnameOriginal);
        setFirstName(firstNameOriginal);

        setError("");
        setSuccessMessage("");
    }

    const closeModalDetails = () => {
        setIsModalOpenDetails(false);

        setError("");
        setSuccessMessage("");
    }

    //State variables and functions for Password Change Pop-Up
    const [isModalOpenPassword, setIsModalOpenPassword] = useState(false);

    const openModalPassword = () => {
        setIsModalOpenPassword(true);
        setIsModalOpenDetails(false);

        setPassword("");
        setNewPassword("");
        setNewReEnteredPassword("");
        setEmail(emailOriginal);
        setSurname(surnameOriginal);
        setFirstName(firstNameOriginal);

        setError("");
        setSuccessMessage("");
    }

    const closeModalPassword = () => {
        setIsModalOpenPassword(false);
        setIsModalOpenDetails(true);

        setError("");
        setSuccessMessage("");
    }

    //State variables and functions for Delete Confirmation Pop-Up
    const [isModalOpenDelConf, setIsModalOpenDelConf] = useState(false);

    const openModalDelConf = () => {
        setIsModalOpenDelConf(true);

        setError("");
    }

    const closeModalDelConf = () => {
        setIsModalOpenDelConf(false);

        setError("");
    }


    //other variables

    const [email, setEmail] = useState("");

    const [surname, setSurname] = useState("");
    const [firstName, setFirstName] = useState("");

    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newReEnteredPassword, setNewReEnteredPassword] = useState("");

    const [usernameOriginal, setUsernameOriginal] = useState("");
    const [emailOriginal, setEmailOriginal] = useState("");
    const [surnameOriginal, setSurnameOriginal] = useState("");
    const [passwordOriginal, setPasswordOriginal] = useState("");
    const [firstNameOriginal, setfirstNameOriginal] = useState("");


    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const navigate = useNavigate();

    const requestUserDetails = async () => {
        try {
            //fetch request to server
            const response = await fetch("http://localhost:5000/account", {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
            });
            //response from server
            const server_resObject = await response.json();

            // if authorised -> set user details, else -> set error value and go to login page
            if (server_resObject.found === true) {
                setUsernameOriginal(server_resObject.user.username);
                setEmailOriginal(server_resObject.user.email);
                setSurnameOriginal(server_resObject.user.surname);
                setfirstNameOriginal(server_resObject.user.firstname);
                setPasswordOriginal(server_resObject.user.password);
            } else {
                localStorage.removeItem("sessionID");
                localStorage.setItem("globalMessage", server_resObject.message);
                navigate("/login");
            }

        }
        catch (err) {
            console.error(err.message);
        }
    }

    const logOut = async () => {
        try{
            //fetch request to server
            const response = await fetch("http://localhost:5000/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
            });
            //response from server
            const server_resObject = await response.json();

            // if authorised -> set user details, else -> set error value and go to login page
            if (server_resObject.success === true) {
                localStorage.removeItem("sessionID");
                navigate("/login");
            } else {
                console.error("Error logging out");
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    const changePersonalDetails = async () => {
        setError("");
        setSuccessMessage("");
        try {
            const body = { email: email, surname: surname, firstName: firstName};
            //fetch request to server
            const response = await fetch("http://localhost:5000/changePersonalDetails", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
                body: JSON.stringify(body)
            });
            //response from server
            const server_resObject = await response.json();
            console.log(server_resObject);
            // if authorised -> set user details, else -> set error value and go to login page
            if (server_resObject.success === true) {
                setSuccessMessage(server_resObject.message);
                requestUserDetails();
            } 
            else {
                // update could not happen due to session expiration
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                }
                // update could not happen due to validation error or other error
                else {
                    setError(server_resObject.message);
                }
            }

        }
        catch (err) {
            console.error(err.message);
        }
    }


    const changePassword = async () => {
        setError("");
        setSuccessMessage("");
        //check if new passwords match
        if (newPassword !== newReEnteredPassword) {
            setError("New passwords do not match");
            return;
        }

        //check if new password is the same as the old password and replace
        try {
            const body = { password: password, newPassword: newPassword};
            //fetch request to server
            const response = await fetch("http://localhost:5000/changePassword", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
                body: JSON.stringify(body)
            });
            //response from server
            const server_resObject = await response.json();
            console.log(server_resObject);

            // if authorised -> set user details
            if (server_resObject.success === true) {
                setSuccessMessage(server_resObject.message);
                setPassword("");
                setNewPassword("");
                setNewReEnteredPassword("");
                requestUserDetails();
            } 
            else {
                // update could not happen due to session expiration
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                }
                // update could not happen due to validation error or other error
                else {
                    setError(server_resObject.message);
                }
            }

        }
        catch (err) {
            console.error(err.message);
        }
    }

    const deleteAccount = async () => {
        setError("");
        try {
            //fetch request to server
            const response = await fetch("http://localhost:5000/deleteAccount", {
                method: "DELETE",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
            });
            //response from server
            const server_resObject = await response.json();
            console.log(server_resObject);

            // if authorised -> set user details
            if (server_resObject.success === true) {
                localStorage.removeItem("sessionID");
                navigate("/");
            } 
            else {
                // update could not happen due to session expiration
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                }
                // delete failed due to server error
                else {
                    setError(server_resObject.message);
                }
            }

        }
        catch (err) {
            console.error(err.message);
        }
    }



    //Use useEffect to fetch tournament details when the component mounts
    useEffect(() => {
        requestUserDetails();
    }, []);
  
    //Display contents
     return (
        <div>
            <h1>My Account</h1>
            <label>Username: <input type="text" value={usernameOriginal} readOnly /> </label>
            <label>Email: <input type="text" value={emailOriginal} readOnly /> </label>
            <button onClick={logOut}>Log Out</button>
            <button onClick={openModalDetails}>Change Personal Details</button>
            <button on onClick={openModalDelConf}>Delete Account</button>

            {/* Change Personal Details Pop-up */}
            <Modal isOpen={isModalOpenDetails} onClose={closeModalDetails} title="Personal Details" errorDisplay={error} successDisplay={successMessage}>
                <form style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>First Name: <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /> </label>
                    <label>Surname: <input type="text" value={surname} onChange={(e) => setSurname(e.target.value)} required /> </label>
                    <label>Email: <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required /> </label>
                </form>
                <button onClick={openModalPassword}>Change Password</button>
                <button onClick={changePersonalDetails}>Save Changes</button>    
            </Modal>

            {/* Change Password Pop-up */}
            <Modal isOpen={isModalOpenPassword} onClose={closeModalPassword} title="Personal Details" errorDisplay={error} successDisplay={successMessage}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Password: <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /> </label>
                    <label>New Password: <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required/> </label>
                    <label>Re-Enter Password: <input type="password" value={newReEnteredPassword} onChange={(e) => setNewReEnteredPassword(e.target.value)} required /> </label>
                </div>
                <button onClick={changePassword}>Save New Password</button>    
            </Modal>

            {/* Delete Confirmation Pop-up */}
            <Modal isOpen={isModalOpenDelConf} onClose={closeModalDelConf} title="Delete Your Account" errorDisplay={error}>
                <h3>Are you sure you want to delete your account?</h3>
                <p>All your tournaments will be permanently lost.</p>
                <button onClick={deleteAccount}>Confirm</button>
                <button onClick={closeModalDelConf}>Cancel</button>      
            </Modal>
        </div>
    );
}



//Export to be used by App.js
export default MyAccount;