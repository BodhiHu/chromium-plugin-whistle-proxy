export default {
    get(name) {
        return localStorage.getItem(name);
    },
    set(name, value) {
        localStorage.setItem(name, value);
    },
    clear() {
        localStorage.clear();
    }
};