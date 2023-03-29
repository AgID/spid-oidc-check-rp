export const SET_REQUEST = "SET_REQUEST";
export const SET_METADATA_URL = "SET_METADATA_URL";
export const SET_METADATA_CONFIGURATION = "SET_METADATA_CONFIGURATION";
export const SET_TEST_DONE = "SET_TEST_DONE";
export const SET_TEST_SUCCESS = "SET_TEST_SUCCESS";
export const SET_TEST_NOTE = "SET_TEST_NOTE";
export const SET_STORE = "SET_STORE";

class Actions {

    static setRequest(value) {
        return {
            type: SET_REQUEST,
            value: value
        }        
    }

    static setMetadataURL(value) {
        return {
            type: SET_METADATA_URL,
            value: value
        }        
    }

    static setMetadataConfiguration(value) {
        return {
            type: SET_METADATA_CONFIGURATION,
            value: value
        }        
    }

    static setTestDone(key, value) {
        return {
            type: SET_TEST_DONE,
            key: key,
            value: value
        }        
    }

    static setTestSuccess(key, value) {
        return {
            type: SET_TEST_SUCCESS,
            key: key,
            value: value
        }        
    }

    static setTestNote(key, value) {
        return {
            type: SET_TEST_NOTE,
            key: key,
            value: value
        }        
    }

    static setStore(value) {
        return {
            type: SET_STORE,
            value: value
        }        
    }
}

export default Actions;
