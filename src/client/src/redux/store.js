import { createStore, applyMiddleware } from "redux"
import initialState_Util from "./util/initialState";
import transitions_Util from "./util/transitions"
import initialState_Modal from "./modal/initialState";
import transitions_Modal from "./modal/transitions"
import initialState_Main from "./main/initialState";
import transitions_Main from "./main/transitions"
import localStorage from "./localStorage"
import Utility from "../utility";

class Store {

    constructor() {

    }

    static getModal() {
        if(this.modal == null) {
            let modal_state = localStorage.loadState('modal', initialState_Modal);
            this.modal = createStore(transitions_Modal, modal_state, applyMiddleware(logger));
            Utility.log("STORE", "MODAL STORE CREATED");

            // save state on every change to store
            this.modal.subscribe(()=> { 
                localStorage.saveState('modal', this.modal.getState());
                Utility.log("STORE MODAL - Local Storage Updated", this.util.getState());
            });
        }
        return this.modal;
    }    
    
    static getUtil() {
        if(this.util == null) {
            let util_state = localStorage.loadState('util', initialState_Util);
            this.util = createStore(transitions_Util, util_state, applyMiddleware(logger));
            Utility.log("STORE", "UTIL STORE CREATED");

            // save state on every change to store
            this.util.subscribe(()=> { 
                localStorage.saveState('util', this.util.getState()); 
                Utility.log("STORE UTIL - Local Storage Updated", this.util.getState());
            });
        }
        return this.util;
    }    

    static getMain() {
        if(this.main == null) {
            let main_state = localStorage.loadState('main', initialState_Main);
            this.main = createStore(transitions_Main, main_state, applyMiddleware(logger));
            Utility.log("STORE", "MAIN STORE CREATED");

            // save state on every change to store
            this.main.subscribe(()=> { 
                localStorage.saveState('main', this.main.getState());
                Utility.log("STORE MAIN - Local Storage Updated", this.util.getState());
            });
        }
        return this.main;
    }      
    
}

const logger = store => next => action => {
    Utility.log('STORE Current Action: ', action)
    let result = next(action)
    Utility.log('STORE Next State: ', store.getState())
    return result;
} 

export default Store;
