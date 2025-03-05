// Import React library and css file
import React from 'react';
import "./Modal.css";

//Functional component with props
const Modal = ({ isOpen, onClose, title, errorDisplay, successDisplay, children }) => {
    //if isOpen is set to false, return null
    if (!isOpen) return null;

    //otherwise, return the pop-up window
    return (
        //If clicked outside the pop-up, run onClose function
        <div className="modal-overlay" onClick={onClose}>
            {/*If clicked inside the pop-up, do not close the pop-up*/}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/*Close button. If clicked, run onClose function*/}
                <button onClick={onClose}>X</button>
                {/*Title, error message, success message and children passed from parent component*/}
                <h2>{title}</h2>
                {errorDisplay && <p className="error">{errorDisplay}</p>}
                {successDisplay && <p className="successMessage">{successDisplay}</p>}
                {children}
            </div>
        </div>
    );
}
//Export Modal component
export default Modal;

