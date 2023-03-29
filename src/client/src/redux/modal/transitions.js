import initialState from "./initialState";
import * as Type from "./actions";


function transitions(state = initialState, action) {
 
    switch(action.type) {

        case Type.SET_INFO:
            state = Object.assign({}, state, {
                title: action.value.title,
                subtitle: action.value.subtitle,
                body: action.value.body,
                isOpen: action.value.isOpen,
                hideButtons: action.value.hideButtons,
                btnPrimaryFunc: action.value.btnPrimaryFunc,
                btnPrimaryText: action.value.btnPrimaryText,
                btnSecondaryFunc: action.value.btnSecondaryFunc,
                btnSecondaryText: action.value.btnSecondaryText,
                switch1: action.value.switch1,
                switch1Func: action.value.switch1Func,
                switch1Text: action.value.switch1Text,
                switch2: action.value.switch2,
                switch2Func: action.value.switch2Func,
                switch2Text: action.value.switch2Text,
                inputVisible: action.value.inputVisible,
                inputEnabled: action.value.inputEnabled,
                input: action.value.input, 
                inputFunc: action.value.inputFunc
            });
            break;     
            
        default: 
            state = Object.assign({}, state);
            break;  
    }

    return state;
}

export default transitions;
