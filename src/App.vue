<template>
    <div id="app">
        <h1>WHISTLE 规则管理</h1>
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
            <ul v-if="rules">
                <li v-for="(item, index) in rules" :key="index">
                    <div class="btn-container">
                        <div class="btn" :class="{enabled: item.selected}" @click.stop.prevent="change(item)"><span></span></div>
                    </div>
                    <div class="name">{{item.name}}</div>
                </li>
            </ul>
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
            init(reset) {
                if (reset) {
                    this.hasInit = false;
                }
                $http.get(`${this.url}/cgi-bin/init?_=${new Date().getTime()}`).then(res => {
                    this.hasInit = true;
                    this.clientId = res.clientId;
                    this.rules = res.rules.list;
                    console.log(this.rules);
                }).catch(err => {
                    this.hasInit = true;
                });
            },
            options(url) {
                $http.options(url);
            },
            reload() {
                Storage.set('apiUrl', this.apiUrl);
                this.init(true);
            },
            enable(item) {
                let url = `${this.url}/cgi-bin/rules/select`;
                $http.post(url, {
                    clientId: this.clientId,
                    name: item.name,
                    value: item.data,
                    selected: true,
                    active: true,
                    key: `w-reactkey-${item.index + 2}`,
                    icon: 'checkbox',
                    hide: false,
                    changed: false
                }).finally(_ => {
                    this.init();
                });
            },
            disable(item) {
                let url = `${this.url}/cgi-bin/rules/unselect`;
                $http.post(url, {
                    clientId: this.clientId,
                    name: item.name,
                    value: item.data,
                    selected: true,
                    active: true,
                    key: `w-reactkey-${item.index + 2}`,
                    icon: 'checkbox',
                    hide: false,
                    changed: false
                }).finally(_ => {
                    this.init();
                });
            },
            change(item) {
                item.selected ? this.disable(item) : this.enable(item);
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

    .content {
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
        ul, li {
            list-style: none;
            padding: 0;
        }
        li {
            line-height: 30px;
            border-bottom: 1px dashed #cccccc;
            &:hover {
                background: #efefef;
            }
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
                    }
                    &.enabled {
                        background: rgb(19, 206, 102);
                        span {
                            float: right;
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

    .tips {
        margin-bottom: 10px;
        a {
            color: #333333;
        }
    }
</style>
