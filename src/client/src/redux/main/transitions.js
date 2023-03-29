import initialState from "./initialState";
import * as Type from "./actions";


function transitions(state = initialState, action) {
 
    switch(action.type) {

        case Type.SET_REQUEST:
            state = Object.assign({}, state, {
                request: action.value
            });
            break;     

        case Type.SET_METADATA_URL:
            state = Object.assign({}, state, {
                metadata_url: action.value
            });
            break

        case Type.SET_METADATA_CONFIGURATION:
            state = Object.assign({}, state, {
                metadata_configuration: action.value
            });
            break;     

        case Type.SET_TEST_DONE:
            let test_done = state.test_done;
            test_done[action.key] = action.value;

            state = Object.assign({}, state, {
                test_done: test_done
            });
            break

        case Type.SET_TEST_SUCCESS:
            let test_success = state.test_success;
            test_success[action.key] = action.value;

            state = Object.assign({}, state, {
                test_success: test_success
            });
            break; 

        case Type.SET_TEST_NOTE:
            let test_note = state.test_note;
            test_note[action.key] = action.value;

            state = Object.assign({}, state, {
                test_note: test_note
            });
            break; 

        case Type.SET_STORE:
            state = Object.assign({}, state, action.value);
            break; 

        default: 
            state = Object.assign({}, state);
            break;  
    }

    return state;
}

export default transitions;
