
class LocalStorage {

    static loadState(store, initialState=undefined) {
        try {
            const serializedState = localStorage.getItem(store);
            if (serializedState === null) {
                return initialState;
            }
            return JSON.parse(serializedState);
        } catch (err) {
            return initialState;
        }
    }

    static saveState(store, state) {
        try {
            const serializedState = JSON.stringify(state);
            localStorage.setItem(store, serializedState);
        } catch {
            // ignore write errors
        }
    }

}

export default LocalStorage;