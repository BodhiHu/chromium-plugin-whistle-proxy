<template>
    <div id="app">
        <transition name="fade">
            <div class="loading" v-show="loading">
                <svg width="40px" height="40px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
                     preserveAspectRatio="xMidYMid" class="lds-infinity" style="background: none;">
                    <path fill="none" ng-attr-stroke="{{config.stroke}}" ng-attr-stroke-width="{{config.width}}"
                          ng-attr-stroke-dasharray="{{config.dasharray}}"
                          d="M24.3,30C11.4,30,5,43.3,5,50s6.4,20,19.3,20c19.3,0,32.1-40,51.4-40 C88.6,30,95,43.3,95,50s-6.4,20-19.3,20C56.4,70,43.6,30,24.3,30z"
                          stroke="#409eff" stroke-width="5" stroke-dasharray="153.95335693359377 102.63557128906248">
                        <animate attributeName="stroke-dashoffset" calcMode="linear" values="0;256.58892822265625"
                                 keyTimes="0;1" dur="1.5" begin="0s" repeatCount="indefinite"></animate>
                    </path>
                </svg>
            </div>
        </transition>
        <el-card v-if="!hasInit">
            {{messages.loading}}
        </el-card>
        <el-card class="failed" v-if="hasInit && !rules">
            <div class="tips">{{messages.tipFailed}}</div>
            <div class="input">
                <el-input v-model="apiUrl" size="mini"></el-input>
            </div>
            <div class="btns">
                <el-button size="mini" type="primary" icon="el-icon-refresh" @click.stop.prevent="reload">
                    {{messages.btnSave}}
                </el-button>
            </div>
        </el-card>
        <div v-if="rules" class="main-content">
            <el-tabs type="border-card">
                <el-tab-pane :label="messages.title1">
                    <div class="content list">
                        <div class="item">
                            <div class="name">{{messages.defaultRule}}</div>
                            <el-switch v-model="defaultEnabled" @change="changeDefault"></el-switch>
                        </div>
                        <div class="item" v-for="(item, index) in rules" :key="index">
                            <div class="name">{{item.name}}</div>
                            <el-switch v-model="item.selected" @change="change(item)"></el-switch>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane :label="messages.title2">
                    <div class="content">
                        <el-form label-width="80px" size="mini">
                            <el-form-item :label="messages.multiple">
                                <el-switch v-model="allowMultipleChoice" @change="setAllowMultipleChoice"></el-switch>
                                <span class="help-inline">{{messages.tip_multiple}}</span>
                            </el-form-item>
                            <el-form-item :label="messages.refresh">
                                <el-switch v-model="autoRefresh" @change="setAutoRefresh"></el-switch>
                                <span class="help-inline">{{messages.tip_refresh}}</span>
                            </el-form-item>
                            <el-form-item label="Port">{{server.port}}</el-form-item>
                            <el-form-item label="IPv4">
                                <div v-for="item in server.ipv4" class="copy-list">
                                    <div class="text">{{item}}</div>
                                    <span class="btn-copy" :data-clipboard-text="item">
                                        <i class="el-icon-tickets"></i>
                                        <i class="el-icon-tickets"></i>
                                    </span>
                                </div>
                            </el-form-item>
                            <el-form-item>
                                <a v-bind:href="apiUrl" target="_blank" style="color: #409EFF; text-decoration: none">
                                    {{messages.moreSettings}}</a>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
            </el-tabs>
            <div class="more-settings">
                <div class="label">
                    <div>{{messages.enable}}</div>
                    <div>{{messages.tip_enable}}</div>
                </div>
                <el-switch v-model="proxyEnabled" @change="setProxyStatus"></el-switch>
            </div>
        </div>
    </div>
</template>
<script>

    import Clipboard from 'clipboard';

    const $http = chrome.extension.getBackgroundPage().$http;
    const $storage = chrome.extension.getBackgroundPage().$storage;
    const $proxy = chrome.extension.getBackgroundPage().$proxy;
    const $i18n = chrome.i18n.getMessage;
    const tabs = chrome.tabs;

    export default {
        name: 'app',
        data() {
            return {
                loading: false,
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
                },
                clipboard: null
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
                this.fixRerender();
            },
            async setAllowMultipleChoice(value) {
                let url = `${this.url}/cgi-bin/rules/allow-multiple-choice`;
                await $http.post(url, {
                    clientId: this.clientId,
                    allowMultipleChoice: value ? 1 : 0
                });
                this.init();
                this.fixRerender();
            },
            handleChange() {
                this.fixRerender();
                if (this.autoRefresh) {
                    tabs.reload();
                }
            },
            fixRerender() {
                this.loading = true;
                setTimeout(_ => {
                    this.loading = false;
                }, 100)
            }
        },
        mounted() {
            this.init(true);
            this.clipboard = new Clipboard('.btn-copy');
        }
    }
</script>

<style lang="scss">
    body {
        padding: 0;
        margin: 0;
        width: 300px;
        font: 14px/1.5 "Source Sans Pro", "Helvetica Neue", Arial, sans-serif;
    }

    #app {
        background: #ffffff;
        overflow: auto;
    }

    .loading {
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        z-index: 10;
        display: flex;
        justify-content: center;
        background-image: linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));

        svg {
            width: 40px;
            height: 40px;
        }
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .3s;
    }

    .fade-enter, .fade-leave-to {
        opacity: 0;
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
        padding: 0 5px;
    }

    .list {
        .item {
            height: 20px;
            line-height: 20px;
            margin: 8px 0;
            display: flex;

            &:first-child {
                margin-top: 0;
            }

            &:last-child {
                margin-bottom: 0;
            }

            .el-switch {
                width: 40px;
                margin-left: 20px;
            }

            .name {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                color: #606267;
                flex: 1;
            }
        }
    }

    .help-inline {
        margin-left: 5px;
        color: #aaaaaa;
    }

    .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item {
        margin-bottom: 5px;
    }

    .el-form-item__label {
        text-align: left;
    }

    .main-content {
        position: relative;
        padding-bottom: 50px;

        .el-tabs__header {
            margin-bottom: 0;

            .el-tabs__item {
                font-size: 16px !important;
                font-weight: bold;
            }
        }

        .el-tabs__content {
            max-height: 400px;
            overflow: auto;
            padding-bottom: 20px;
        }

        .copy-list {
            display: flex;
            align-items: center;
            border-bottom: 1px dashed #efefef;

            .text {
                flex: 1;
            }

            .btn-copy {
                cursor: pointer;
                color: #409EFF;

                i:first-child {
                    transform: translate(15px, -2px);
                }

                i:last-child {
                    background: #ffffff;
                    transform: translate(-2px, 1px);
                }
            }
        }

        .more-settings {
            height: 50px;
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            align-items: center;
            padding: 0 20px;
            background: #ffffff;
            border-top: 1px solid #efefef;
            box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.2);
            z-index: 100;

            .label {
                flex: 1;

                > div {
                    font-size: 12px;
                    color: #999;

                    &:first-child {
                        font-size: 14px;
                        color: #333;
                        font-weight: bold;
                    }
                }
            }
        }
    }

</style>
