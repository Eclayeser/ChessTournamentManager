import React from 'react';

import "./Modal.css";

const Modal = ({ isOpen, onClose, title, errorDisplay, successDisplay, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose}>X</button>
                <h2>{title}</h2>
                {errorDisplay && <p className="error">{errorDisplay}</p>}
                {successDisplay && <p className="successMessage">{successDisplay}</p>}
                {children}
            </div>
        </div>
    );
}

export default Modal;