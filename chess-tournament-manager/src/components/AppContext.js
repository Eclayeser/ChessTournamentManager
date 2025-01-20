//used to create a context for the app 
//used to store global variables: username, password for ensuring authorised access
//error to be displayed in case of incorrect authorisation caused by any component
import { createContext } from "react";

export const AppContext = createContext();