import Vue from 'vue'
import App from './App.vue'
import {Input, Switch, Card, Button, Form, FormItem} from 'element-ui';

Vue.config.productionTip = false;
Vue.component(Input.name, Input);
Vue.component(Switch.name, Switch);
Vue.component(Card.name, Card);
Vue.component(Button.name, Button);
Vue.component(Form.name, Form);
Vue.component(FormItem.name, FormItem);

new Vue({
    render: h => h(App)
}).$mount('#app');
