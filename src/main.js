import Vue from 'vue'
import App from './App.vue'
import {Input, Button, Form, FormItem, Card, Switch, Tabs, TabPane} from 'element-ui';

Vue.config.productionTip = false;
Vue.component(Input.name, Input);
Vue.component(Button.name, Button);
Vue.component(Form.name, Form);
Vue.component(FormItem.name, FormItem);
Vue.component(Card.name, Card);
Vue.component(Switch.name, Switch);
Vue.component(Tabs.name, Tabs);
Vue.component(TabPane.name, TabPane);

new Vue({
    render: h => h(App)
}).$mount('#app');
