(function (root, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        define([], factory);
    }
    else if (typeof exports === 'object')
    {
        module.exports = factory();
    }
    else
    {
        root.iframeBridge = factory();
    }
}(this, function ()
{

    //辅助函数 --------------  copy from angular ----------------------------

    function isUndefined (value)
    {
        return typeof value === 'undefined';
    }

    function isDefined (value)
    {
        return typeof value !== 'undefined';
    }

    function isObject (value)
    {
        // http://jsperf.com/isobject4
        return value !== null && typeof value === 'object';
    }

    function isString (value)
    {
        return typeof value === 'string';
    }

    function isNumber (value)
    {
        return typeof value === 'number';
    }

    function isDate (value)
    {
        return toString.call(value) === '[object Date]';
    }

    var isArray = Array.isArray;

    function isFunction (value)
    {
        return typeof value === 'function';
    }

    function isRegExp (value)
    {
        return toString.call(value) === '[object RegExp]';
    }

    function isBoolean (value)
    {
        return typeof value === 'boolean';
    }

    //辅助函数 end --------------------------------------------


    //自定义工具类 ---------------------------------------------

    var Util = {
        /**
         * 遍历
         * @param obj {object | array}
         * @param func
         */
        each: function (obj, func)
        {
            var item;
            if (isObject(obj))
            {
                var key;
                for (key in obj)
                {
                    if (obj.hasOwnProperty(key))
                    {
                        item = obj[key];
                        func(item, key);
                    }
                }
            }
            else if (isArray(obj))
            {
                var i = 0;
                var l = obj.length;
                for (i; i < l; i ++)
                {
                    item = obj[i];
                    if (isDefined(item)) func(item, i);
                }
            }
        },

        some: function (obj, func)
        {
            if (isObject(obj))
            {
                var key;
                for (key in obj)
                {
                    if (obj.hasOwnProperty(key) && func(obj[key], key)) return true;
                }
            }
            else if (isArray(obj))
            {
                var i = 0;
                var l = obj.length;
                for (i; i < l; i ++)
                {
                    if (isDefined(obj[i]) && func(obj[i], i)) return true;
                }
            }
            return false;
        },

        bind: function (func, ctx)
        {
            if (!isFunction(func)) return false;
            var args = Array.prototype.slice.call(arguments, 2);
            return function ()
            {
                return func.apply(ctx, args.concat(Array.prototype.slice.call(arguments)));
            }
        },

        extend: function (base, arg)
        {
            if (!isObject(arg))
            {
                return base;
            }
            this.each(arg, function (value, key)
            {
                base[key] = value;
            });
            return base;
        },

        object: {
            /**
             * 判断 host 是否包含 obj
             * @param host 宿主对象
             * @param obj 需要判断的对象
             */
            contain: function (host, obj)
            {
                if (! (isObject(host) && isObject(obj)))
                {
                    return false;
                }
                var invalid = Util.some(obj, function (value, key)
                {
                    if (value !== host[key])
                    {
                        return true;
                    }
                });
                return ! invalid;
            }
        },

        array: {

            /**
             * 倒序遍历
             * @param array
             * @param func
             */
            reverseEach: function (array, func)
            {
                if (! isArray(array)) return false;
                var i = array.length;
                var item;
                while (i --)
                {
                    item = array[i];
                    if (isDefined(item)) func(item, i);
                }
            },

            /**
             * 删除数组中的元素
             * @param array
             * @param reason {number | function | object}
             * number : 该元素在数组中的 index
             * function (item, index) : 自定义删除逻辑，返回 true 时删除
             * object : 和数组中的元素做对比，key和value 都匹配时删除
             */
            remove: function (array, reason)
            {
                var index = - 1;
                if (isNumber(reason))
                {
                    index = reason;
                }
                else if (isObject(reason) || isFunction(reason))
                {
                    index = Util.array.indexOf(array, reason);
                }
                if (index > - 1) array.splice(index, 1);
            },
            /**
             * 删除数组中的元素，满足条件的全部删除
             * @param array
             * @param reason {function | object}
             * function (item, index) : 自定义删除逻辑，返回 true 时删除
             * object : 和数组中的元素做对比，key和value 都匹配时删除
             */
            removeAll: function (array, reason)
            {
                if (!(isObject(reason) || isFunction(reason))) return false;
                var index = Util.array.indexOf(array, reason);
                if (index > -1)
                {
                    array.splice(index, 1);
                    Util.array.removeAll(array, reason);
                }
                else
                {
                    return true;
                }
            },
            /**
             * 查找在数组中位置
             * @param array
             * @param reason {function | object}
             * function (item, index) : 自定义逻辑，返回 true 时
             * object : 和数组中的元素做对比，key和value都匹配时
             */
            indexOf: function (array, reason)
            {
                var i = array.length;
                var index = - 1;
                var item;
                while (i --)
                {
                    item = array[i];

                    if (isObject(reason))
                    {
                        if (Util.object.contain(item, reason))
                        {
                            index = i;
                            break;
                        }
                    }
                    else if (isFunction(reason))
                    {
                        if (reason(item, i))
                        {
                            index = i;
                            break;
                        }
                    }
                }
                return index;
            }
        }
    };

    Util.object.extend = Util.extend;

    Util.array.each = Util.each;

    Util.array.some = Util.some;

    //自定义工具类 end ----------------------------------------------------


    function Bridge(frame, options)
    {
        this.frame = frame;
        this.options = Util.extend({
            timeout: 15000,
            allowOrigin: '*'
        }, options);
        this.MSG_INDEX = 0;
        this.eventHandles = [];
        this.requestHandles = [];
        this.respondInstance = {};

        window.addEventListener("message", Util.bind(this.handleMessageEvent, this), false);
    }

    Bridge.prototype.MSG_TYPE = {
        EVENT: 'event',
        REQUEST: 'request',
        RESPOND: 'respond'
    };

    Bridge.prototype.ERROR = {
        TIMEOUT: {
            code: 'timeout',
            msg: 'iframe 服务调用超时'
        }
    };

    Bridge.prototype.CALLBACK_POSTFIX = {
        SUCCESS: '_success',
        ERROR: '_error'
    };

    /**
     * 向注册的 frame 发送消息
     * @param msg
     */
    Bridge.prototype.postMessage = function (msg)
    {
        this.frame.postMessage(msg, this.options.allowOrigin);
    };

    Bridge.prototype.handleMessageEvent = function (event)
    {
        var msg = event.data;
        var type = msg.type;
        var name = msg.name;
        var events = this.eventHandles;
        var requests = this.requestHandles;
        if (type === this.MSG_TYPE.EVENT)
        {
            Util.array.reverseEach(events, function (item)
            {
                if (item.name !== msg.name) return true;
                if (isFunction(item.callback)) item.callback(msg.detail);
                //如果只执行一次，从队列中移除
                if (item.once)
                {
                    Util.array.remove(events, index);
                }
            });
        }
        else if (type === this.MSG_TYPE.RESPOND)
        {
            var index = Util.array.indexOf(requests, {id: msg.id});
            if (index > -1)
            {
                var req = requests[index];
                clearTimeout(req._timeout);
                req.callback(msg.detail);
                Util.array.removeAll(requests, {_timeout: req._timeout});
            }
        }
        else if (type === this.MSG_TYPE.REQUEST)
        {
            var func = this.respondInstance[name];
            if (isFunction(func)) func(msg);
        }

    };

    Bridge.prototype.on = function (name, callback)
    {
        this.eventHandles.push({
            name: name,
            callback: callback
        });
    };
    Bridge.prototype.bind = Bridge.prototype.on;

    Bridge.prototype.off = function (name, callback)
    {
        Util.array.remove(this.eventHandles, {
            name: name,
            callback: callback
        });
    };
    Bridge.prototype.unbind = Bridge.prototype.off;

    Bridge.prototype.once = function (name, callback)
    {
        this.eventHandles.push({
            name: name,
            once: true,
            callback: callback
        });
    };

    Bridge.prototype.trigger = function (name, detail)
    {
        this.postMessage({
            name: name,
            type: this.MSG_TYPE.EVENT,
            detail: detail
        })
    };

    Bridge.prototype.request = function (name, success, error, detail, options)
    {
        var root = this;
        var id = name + this.MSG_INDEX ++;
        var id_success = id + root.CALLBACK_POSTFIX.SUCCESS;
        var id_error = id + root.CALLBACK_POSTFIX.ERROR;
        this.postMessage({
            id: id,
            name: name,
            detail: detail,
            type: root.MSG_TYPE.REQUEST
        }, '*');
        //添加延迟回调
        var timeout = (options && options.timeout) || this.options.timeout;
        var _timeout = setTimeout(function ()
        {
            error(root.ERROR.TIMEOUT);
            //从 Events 删除 对应的 success 和 error
            Util.array.removeAll(root.requestHandles, {_timeout: _timeout});
        }, timeout);
        //添加成功回调
        root.requestHandles.push({
            id: id_success,
            name: name,
            callback: success,
            _timeout: _timeout
        });
        //添加失败回调
        root.requestHandles.push({
            id: id_error,
            name: name,
            callback: error,
            _timeout: _timeout
        });
    };

    Bridge.prototype.respond = function (name, func)
    {
        var root = this;
        this.respondInstance[name] = function (msg)
        {
            var id_success = msg.id + root.CALLBACK_POSTFIX.SUCCESS;
            var id_error = msg.id + root.CALLBACK_POSTFIX.ERROR;
            func(msg.detail, function (result) {
                root.postMessage({
                    id: id_success,
                    type: root.MSG_TYPE.RESPOND,
                    detail: result
                });
            }, function (err)
            {
                root.postMessage({
                    id: id_error,
                    type: root.MSG_TYPE.RESPOND,
                    detail: err
                });
            });
        };
    };

    return function (frame, options)
    {
        return new Bridge(frame, options);
    }

}));
