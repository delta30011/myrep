import { createStore } from 'vuex'

export default createStore({
    state() {
        return {
            forms: {}
        }
    },

    getters: {
        allForms: (state) => state.forms,
        formById: (state) => (id) => state.forms[id]
    },

    mutations: {
        save_form(state, data) {
            state.forms[data?.id] = data?.data
        },
        delete_form(state, id) {
            try {
                delete state.forms[id];
            } catch(e) {console.log(e)}
        }
    },

    actions: {
    }
})
