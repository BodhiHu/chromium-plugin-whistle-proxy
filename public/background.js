window.$http = {
    /**
     * json 转换为查询数据
     * @param obj
     * @return {string}
     */
    jsonToQueryString: function (obj) {
        let queryString = '';
        for (let k in obj) {
            let value = obj[k];
            if (typeof value !== 'string') {
                value = JSON.stringify(value);
            }
            queryString += k + '=' + encodeURIComponent(value) + '&';
        }
        return queryString.replace(/&$/g, '');
    },
    createXhr: function (url, type, success, failed) {
        let xhr = new XMLHttpRequest();
        xhr.open(type.toUpperCase(), url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        success && success(JSON.parse(xhr.responseText), xhr);
                    } catch (e) {
                        failed(e);
                    }
                } else {
                    failed && failed(xhr);
                }
            }
        };
        return xhr;
    },
    post: function (url, data) {
        return new Promise((resolve, reject) => {
            let xhr = $http.createXhr(url, 'post', resolve, reject);
            if (data && data instanceof FormData) {
                return xhr.send(data);
            }
            xhr.send(data && typeof data !== 'string' ? $http.jsonToQueryString(data) : data);
        });
    },
    get: function (url, data) {
        return new Promise((resolve, reject) => {
            if (data) {
                url = url + (url.indexOf('?') ? '&' : '?') + (typeof data === 'string' ? data : $http.jsonToQueryString(data));
            }
            let xhr = $http.createXhr(url, 'get', resolve, reject);
            xhr.send()
        });
    }
};

window.$storage = {
    getApiUrl() {
        return localStorage.getItem('whistle-api-url');
    },
    setApiUrl(value) {
        try {
            new URL(value);
            localStorage.setItem('whistle-api-url', value);
        } catch (e) {

        }
    },
    removeApiUrl() {
        localStorage.removeItem('whistle-api-url');
    }
};

window.$proxy = {
    enable() {
        return new Promise(resolve => {
            url = new URL($storage.getApiUrl());
            let proxyObj = {
                scheme: url.protocol.replace(/:$/, ''),
                host: url.hostname,
                port: parseInt(url.port, 10)
            };
            let proxyConfig = {
                mode: 'fixed_servers',
                rules: {
                    proxyForFtp: proxyObj,
                    proxyForHttp: proxyObj,
                    proxyForHttps: proxyObj
                }
            };
            chrome.proxy.settings.set({value: proxyConfig, scope: 'regular'}, function () {
                resolve();
            });
        });
    },
    disable() {
        return new Promise(resolve => {
            chrome.proxy.settings.set({value: {mode: 'system'}, scope: 'regular'}, function () {
                resolve();
            })
        });
    },
    get() {
        return new Promise(resolve => {
            chrome.proxy.settings.get({incognito: false}, config => {
                let url = new URL($storage.getApiUrl());
                let hasEnableWhistleProxy;
                try {
                    let proxyConfig = config.value.rules.proxyForHttp || config.value.rules.proxyForHttps || config.value.rules.proxyForFtp;
                    hasEnableWhistleProxy = proxyConfig.host === url.hostname && proxyConfig.port === parseInt(url.port, 10) && proxyConfig.scheme === url.protocol.replace(/:$/, '');
                } catch (e) {
                    hasEnableWhistleProxy = false;
                }
                hasEnableWhistleProxy ? $utils.setTitle(`${chrome.i18n.getMessage('enableTipBackground')}${$storage.getApiUrl()}`) : $utils.setTitle(chrome.i18n.getMessage('disableTipBackground'));
                chrome.browserAction.setIcon({
                    path: hasEnableWhistleProxy ? 'icon.png' : 'icon_disabled.png'
                });
                resolve(hasEnableWhistleProxy);
            });
        });
    }
};
window.$utils = {
    setTitle(title) {
        chrome.browserAction.setTitle({
            title: `${chrome.i18n.getMessage('titleBackground')}${title}`
        });
    }
};
(_ => {
    if (!$storage.getApiUrl()) {
        $storage.setApiUrl('http://127.0.0.1:8899/');
    }
    $http.get(`${$storage.getApiUrl().replace(/\/$/, '')}/cgi-bin/init?_=${new Date().getTime()}`).then(_ => {
        $proxy.get();
    }).catch(_ => {
        $proxy.disable().finally(_ => {
            $proxy.get();
        });
    });
})();