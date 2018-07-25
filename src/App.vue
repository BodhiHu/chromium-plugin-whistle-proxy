<template>
    <div id="app">
        <h1>WHISTLE 规则列表</h1>
        <div class="content">
            <div class="loading" v-if="!hasInit">规则加载中...</div>
            <div class="failed" v-if="hasInit && !rules">
                <div class="tips">加载失败，请确认whistle已经启动且下面的地址是正确的（若不正确，输入正确的地址）</div>
                <div class="input">
                    <input type="text" v-model="apiUrl">
                </div>
                <div class="btns">
                    <a href="javascript:void(0);" class="btn" @click.stop.prevent="reload">重新加载</a>
                </div>
            </div>
            <div v-if="rules" class="list-container">
                <div v-if="hasInit" class="list-item">
                    <div class="btn-container">
                        <div v-show="defaultEnabled" class="btn enabled" @click.stop.prevent="changeDefault"><span></span></div>
                        <div v-show="!defaultEnabled" class="btn" @click.stop.prevent="changeDefault"><span></span></div>
                    </div>
                    <div class="name">默认规则</div>
                </div>
                <div class="list-item" v-for="(item, index) in rules" :key="index">
                    <div class="btn-container">
                        <div v-show="item.selected" class="btn enabled" @click.stop.prevent="change(item, index)"><span></span></div>
                        <div v-show="!item.selected" class="btn" @click.stop.prevent="change(item, index)"><span></span></div>
                    </div>
                    <div class="name">{{item.name}}</div>
                </div>
                <div class="clear"></div>
            </div>
            <div class="server-info">
                <h1>代理信息</h1>
                <div class="row">
                    <div class="title">Port</div>
                    <div class="info">{{server.port}}</div>
                </div>
                <div class="row">
                    <div class="title">IPv4</div>
                    <div class="info" v-html="server.ipv4.join('</br>')"></div>
                </div>
                <div class="row">
                    <div class="title">IPv6</div>
                    <div class="info" v-html="server.ipv6.join('</br>')"></div>
                </div>
            </div>
        </div>
        <div class="tips">
            <a v-bind:href="apiUrl" target="_blank">更多设置</a>
        </div>
    </div>
</template>
<script>
    import Storage from './common/storage';

    const $http = chrome.extension.getBackgroundPage().$http;

    export default {
        name: 'app',
        data() {
            return {
                apiUrl: Storage.get('apiUrl') || 'http://127.0.0.1:8899/',
                server: {},
                defaultEnabled: false,
                defaultRules: '',
                lastRowId: '',
                hasInit: false,
                clientId: '',
                rules: null
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
                    return false;
                }
            },
            async init(reset) {
                if (reset) {
                    this.hasInit = false;
                }
                await this.getInitInfo();
                this.hasInit = true;
            },
            reload() {
                Storage.set('apiUrl', this.apiUrl);
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
                this.setEnable(item, !item.selected);
            },
            async changeDefault() {
                let url = this.defaultEnabled ? `${this.url}/cgi-bin/rules/disable-default` : `${this.url}/cgi-bin/rules/enable-default`;
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
        width: 200px;
        font: 12px/1.5 "Source Sans Pro", "Helvetica Neue", Arial, sans-serif;
    }

    #app {
        background: #ffffff;
        padding: 0 10px;
        h1 {
            font-size: 14px;
            font-weight: bold;
            border-bottom: 1px solid #cccccc;
            line-height: 2;
        }
    }

    .clear {
        clear: both;
        float: none;
    }

    .content {
        .server-info {
            margin-bottom: 10px;
            .row {
                min-height: 20px;
                line-height: 20px;
                .title {
                    float: left;
                    width: 30px;
                    font-weight: bold;
                }
                .info {
                    margin-left: 40px;
                    color: #6b92fa;
                }
            }
        }
        .failed {
            .tips {
                border-bottom: 1px solid #efefef;
                color: #666;
            }
            .input {
                margin-bottom: 10px;
                input {
                    height: 30px;
                    width: 100%;
                    box-sizing: border-box;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                    outline: none;
                    color: #333333;
                    padding: 0 10px;
                    &:focus {
                        border-color: #78bcfa;
                    }
                }
            }
            .btns {
                margin-bottom: 10px;
                .btn {
                    display: inline-block;
                    padding: 0 10px;
                    height: 30px;
                    line-height: 30px;
                    background: #409eff;
                    color: #fff;
                    border-radius: 4px;
                    text-decoration: none;
                    font-weight: bold;
                    font-size: 14px;
                }
            }
        }
        .loading {
            padding: 20px 0;
            color: #666;
            font-size: 14px;
        }
        .list-container {
            margin-bottom: 10px;
            .list-item {
                line-height: 30px;
                border-bottom: 1px dashed #cccccc;
                .btn-container {
                    float: right;
                    width: 40px;
                    .btn {
                        background: rgb(255, 73, 73);
                        width: 40px;
                        height: 20px;
                        margin: 5px 0;
                        border-radius: 10px;
                        cursor: pointer;
                        span {
                            float: left;
                            width: 16px;
                            height: 16px;
                            background: #ffffff;
                            border-radius: 8px;
                            margin: 2px;
                            transform: translate3d(0, 0, 0);
                        }
                        &.enabled {
                            background: rgb(19, 206, 102);
                            span {
                                transform: translate3d(20px, 0, 0);
                            }
                        }
                    }
                }
                .name {
                    margin-right: 60px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
        }
    }

    .tips {
        margin-bottom: 10px;
        a {
            color: #333333;
        }
    }
</style>
