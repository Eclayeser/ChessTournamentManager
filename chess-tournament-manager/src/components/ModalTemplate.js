// Import React library and css file
import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css"; 

//Functional component with props
const Modal = ({ isOpen, onClose, title, errorDisplay, successDisplay, children }) => {
    //if isOpen is set to false, return null
    if (!isOpen) return null;

    //otherwise, return the pop-up window
    return (
        <>
            {/* Darker background overlay */}
            <div className="modal-backdrop show"></div>

            <div className="modal show d-block" tabIndex="-1" role="dialog" onClick={onClose}>
                {/* 
                    modal: defines pop-up window styling.
                    d-block: makes it a block element.
                    tabIndex="-1": removes the window from the tab order.
                    role="dialog": Indicates that this element is a dialog (advised by bootstrap to use)
                */}
                <div className="modal-dialog modal-dialog-centered" role="document">
                    
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="modal-header"> {/* modal-header: defines the header of the pop-up window */ }
                            <h5 className="modal-title">{title}</h5> {/* modal-title: standard title of the pop-up window */}
                            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                            {/* btn-close: standard close button styling */}
                        </div>

                        {/* Modal Body */}
                        <div className="modal-body">
                            {errorDisplay && <div className="alert alert-danger">{errorDisplay}</div>}
                            {successDisplay && <div className="alert alert-success">{successDisplay}</div>}
                            {children}
                        </div>

                        {/* Modal Footer  */}
                        <div className="modal-footer"> {/* modal-footer: defines the footer of the pop-up window */}
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                            {/* btn btn-secondary: standard secondary button styling (grey, since is not important btn) */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
//Export Modal component
export default Modal;
