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
            <el-card shadow="never">
                <div slot="header"><span>{{messages.title1}}</span></div>
                <div class="list">
                    <div class="item" :class="{active: defaultEnabled}">
                        <div class="operation">
                            <el-switch v-model="defaultEnabled" @change="changeDefault"></el-switch>
                        </div>
                        <div class="name">{{messages.defaultRule}}</div>
                    </div>
                    <div class="item" v-for="(item, index) in rules" :key="index" :class="{active: item.selected}">
                        <div class="operation">
                            <el-switch v-model="item.selected" @change="change(item)"></el-switch>
                        </div>
                        <div class="name">{{item.name}}</div>
                    </div>
                </div>
            </el-card>
            <el-card shadow="never">
                <div slot="header"><span>{{messages.title2}}</span></div>
                <div class="content">
                    <el-form label-width="50px" size="mini">
                        <el-form-item :label="messages.enable">
                            <el-switch v-model="proxyEnabled" @change="setProxyStatus"></el-switch>
                        </el-form-item>
                        <el-form-item label="Port">{{server.port}}</el-form-item>
                        <el-form-item label="IPv4">
                            <div v-html="server.ipv4.join('</br>')"></div>
                        </el-form-item>
                        <el-form-item label="IPv6">
                            <div v-html="server.ipv6.join('</br>')"></div>
                        </el-form-item>
                    </el-form>
                </div>
            </el-card>
            <el-card>
                <a v-bind:href="apiUrl" target="_blank" style="color: #409EFF; text-decoration: none">{{messages.moreSettings}} <i class="el-icon-d-arrow-right"></i></a>
            </el-card>
        </div>
    </div>
</template>
<script>
    const $http = chrome.extension.getBackgroundPage().$http;
    const $storage = chrome.extension.getBackgroundPage().$storage;
    const $proxy = chrome.extension.getBackgroundPage().$proxy;
    const $i18n = chrome.i18n.getMessage;

    export default {
        name: 'app',
        data() {
            return {
                apiUrl: $storage.getApiUrl(),
                server: {},
                proxyEnabled: false,
                defaultEnabled: false,
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
            },
            change(item) {
                this.setEnable(item, item.selected);
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
            },
            async getProxyStatus() {
                this.proxyEnabled = await $proxy.get();
            },
            async setProxyStatus(value) {
                value ? await $proxy.enable() : await $proxy.disable();
                await this.getProxyStatus();
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
        width: 260px;
        font: 12px/1.5 "Source Sans Pro", "Helvetica Neue", Arial, sans-serif;
    }

    #app {
        background: #ffffff;
    }

    .el-card__header {
        padding: 5px 10px;
        font-size: 14px;
        font-weight: bold;
    }

    .el-card__body {
        padding: 10px;
    }

    .el-card {
        border: none;
        border-bottom: 1px solid #ebeef5;
        &:last-child {
            border: none;
        }
    }

    .el-form-item--mini {
        margin-bottom: 5px !important;
    }

    .failed {
        .tips {
            margin-bottom: 10px;
        }
        .input {
            margin-bottom: 10px;
        }
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
            &.active .name {
                font-weight: bold;
                color: #409eff;
            }
        }
    }
</style>
