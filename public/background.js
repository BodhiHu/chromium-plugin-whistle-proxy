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