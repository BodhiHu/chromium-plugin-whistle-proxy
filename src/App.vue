<template>
    <div id="app">
        <el-card v-if="!hasInit">
            {{messages.loading}}
        </el-card>
        <el-card class="failed" v-if="hasInit && !rules">
            <div class="tips">{{messages.tipFailed}}</div>
            <div class="input">
                <el-input v-model="apiUrl" size="mini"></el-input>
            </div>
            <div class="btns">
                <el-button size="mini" type="primary" icon="el-icon-refresh" @click.stop.prevent="reload">{{messages.btnSave}}</el-button>
            </div>
        </el-card>
        <div v-if="rules">
            <div class="box">
                <div class="title"><span>{{messages.title1}}</span></div>
                <div class="content list">
                    <div class="item">
                        <div class="operation">
                            <v-switch v-model="defaultEnabled" @change="changeDefault"></v-switch>
                        </div>
                        <div class="name">{{messages.defaultRule}}</div>
                    </div>
                    <div class="item" v-for="(item, index) in rules" :key="index">
                        <div class="operation">
                            <v-switch v-model="item.selected" @change="change(item)"></v-switch>
                        </div>
                        <div class="name">{{item.name}}</div>
                    </div>
                </div>
            </div>
            <div class="box">
                <div class="title"><span>{{messages.title2}}</span></div>
                <div class="content">
                    <el-form label-width="80px" size="mini">
                        <el-form-item :label="messages.enable">
                            <v-switch v-model="proxyEnabled" @change="setProxyStatus"></v-switch>
                            <span class="help-inline">{{messages.tip_enable}}</span>
                        </el-form-item>
                        <el-form-item :label="messages.multiple">
                            <v-switch v-model="allowMultipleChoice" @change="setAllowMultipleChoice"></v-switch>
                            <span class="help-inline">{{messages.tip_multiple}}</span>
                        </el-form-item>
                        <el-form-item :label="messages.refresh">
                            <v-switch v-model="autoRefresh" @change="setAutoRefresh"></v-switch>
                            <span class="help-inline">{{messages.tip_refresh}}</span>
                        </el-form-item>
                        <el-form-item label="Port">{{server.port}}</el-form-item>
                        <el-form-item label="IPv4">
                            <v-more-details :items="server.ipv4"></v-more-details>
                        </el-form-item>
                        <el-form-item label="IPv6">
                            <v-more-details :items="server.ipv6"></v-more-details>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            <div class="box more-settings">
                <div class="content">
                    <a v-bind:href="apiUrl" target="_blank" style="color: #409EFF; text-decoration: none">{{messages.moreSettings}} <i class="el-icon-d-arrow-right"></i></a>
                </div>
            </div>
        </div>
    </div>
</template>
<script>

    import VMoreDetails from "./components/v-more-details";
    import VSwitch from "./components/v-switch";
    const $http = chrome.extension.getBackgroundPage().$http;
    const $storage = chrome.extension.getBackgroundPage().$storage;
    const $proxy = chrome.extension.getBackgroundPage().$proxy;
    const $i18n = chrome.i18n.getMessage;
    const tabs = chrome.tabs;

    export default {
        name: 'app',
        components: {VSwitch, VMoreDetails},
        data() {
            return {
                activeNames: ['1', '2'],
                apiUrl: $storage.getApiUrl(),
                autoRefresh: $storage.get('auto-refresh') === 'true',
                server: {},
                proxyEnabled: false,
                defaultEnabled: false,
                allowMultipleChoice: false,
                defaultRules: '',
                lastRowId: '',
                hasInit: false,
                clientId: '',
                rules: null,
                messages: {
                    loading: $i18n('loading'),
                    tipFailed: $i18n('tipFailed'),
                    btnSave: $i18n('btnSave'),
                    title1: $i18n('title1'),
                    title2: $i18n('title2'),
                    defaultRule: $i18n('defaultRule'),
                    enable: $i18n('enable'),
                    multiple: $i18n('multiple'),
                    refresh: $i18n('refresh'),
                    tip_enable: $i18n('tip_enable'),
                    tip_multiple: $i18n('tip_multiple'),
                    tip_refresh: $i18n('tip_refresh'),
                    moreSettings: $i18n('moreSettings')
                }
            };
        },
        computed: {
            url() {
                return this.apiUrl.replace(/\/$/, '');
            }
        },
        methods: {
            async getInitInfo() {
                try {
                    let res = await $http.get(`${this.url}/cgi-bin/init?_=${new Date().getTime()}`);
                    this.clientId = res.clientId;
                    this.lastRowId = res.lastDataId;
                    this.rules = res.rules.list;
                    this.defaultEnabled = !res.rules.defaultRulesIsDisabled;
                    this.allowMultipleChoice = res.rules.allowMultipleChoice;
                    this.defaultRules = res.rules.defaultRules;
                    this.server = res.server;
                    return true;
                } catch (e) {
                    console.log(e);
                    return false;
                }
            },
            async init(reset) {
                if (reset) {
                    this.hasInit = false;
                }
                await this.getProxyStatus();
                await this.getInitInfo();
                this.hasInit = true;
            },
            reload() {
                $storage.setApiUrl(this.apiUrl);
                this.init(true);
            },
            async setEnable(item, enable) {
                let url = enable ? `${this.url}/cgi-bin/rules/select` : `${this.url}/cgi-bin/rules/unselect`;
                await $http.post(url, {
                    clientId: this.clientId,
                    name: item.name,
                    value: item.data,
                    selected: true,
                    active: true,
                    key: `w-reactkey-${item.index + 2}`,
                    icon: 'checkbox',
                    hide: false,
                    changed: false
                });
                this.init();
                this.handleChange();
            },
            change(item) {
                this.setEnable(item, item.selected);
                this.handleChange();
            },
            async changeDefault(value) {
                let url = value ? `${this.url}/cgi-bin/rules/enable-default` : `${this.url}/cgi-bin/rules/disable-default`;
                await $http.post(url, {
                    clientId: this.clientId,
                    name: 'Default',
                    fixed: true,
                    value: this.defaultRules,
                    selected: true,
                    isDefault: true,
                    active: true,
                    key: 'w-reactkey-1',
                    icon: 'checkbox'
                });
                this.init();
                this.handleChange();
            },
            async getProxyStatus() {
                this.proxyEnabled = await $proxy.get();
            },
            async setProxyStatus(value) {
                value ? await $proxy.enable() : await $proxy.disable();
                await this.getProxyStatus();
                this.handleChange();
            },
            setAutoRefresh() {
                $storage.set('auto-refresh', this.autoRefresh);
            },
            async setAllowMultipleChoice(value) {
                let url = `${this.url}/cgi-bin/rules/allow-multiple-choice`;
                await $http.post(url, {
                    clientId: this.clientId,
                    allowMultipleChoice: value ? 1 : 0
                });
                this.init();
            },
            handleChange() {
                if (this.autoRefresh) {
                    tabs.reload();
                }
            }
        },
        mounted() {
            this.init(true);
        }
    }
</script>

<style lang="scss">
    body {
        padding: 0;
        margin: 0;
        width: 290px;
        font: 12px/1.5 "Source Sans Pro", "Helvetica Neue", Arial, sans-serif;
    }

    #app {
        background: #ffffff;
        max-height: 600px;
        overflow: auto;
    }

    .box {
        border: 1px solid #ebeef5;
        color: #606267;
        margin-top: -1px;
        .el-form * {
            font-size: 12px !important;
        }
    }

    .title {
        padding: 0 10px;
        line-height: 35px;
        font-size: 14px;
        border-bottom: 1px solid #ebeef5;
    }

    .failed {
        .tips {
            margin-bottom: 10px;
        }
        .input {
            margin-bottom: 10px;
        }
    }

    .content {
        padding: 5px 15px;
    }

    .list {
        .item {
            height: 20px;
            line-height: 20px;
            margin: 5px 0;
            .operation {
                float: right;
                width: 40px;
            }
            .name {
                margin-right: 50px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
    }

    .help-inline {
        margin-left: 5px;
        color: #aaaaaa;
    }

    .el-collapse-item__content {
        padding-bottom: 10px;
    }

    .el-collapse-item:last-child .el-collapse-item__wrap {
        border-bottom: none;
    }

    .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item {
        margin-bottom: 5px;
    }

    .el-collapse-item__header {
        height: 35px;
        line-height: 35px;
        .el-collapse-item__arrow {
            line-height: 35px;
        }
    }
</style>
