iframe bridge
========================================================================================================================

## 使用方法

    支持 amd 和 cmd 方式加载
    或者 <script src = "dist/iframe-bridge.min.js" type = "text/javascript"></script>

### 初始化 iframeBridge 实例
    iframeBridge(frame, options)
* frame: window 中的 frame 对象
* options: 参数
    * options.timeout {number}: request 调用超时时间，默认值 15000ms
    * options.allowOrigin {string}: 限定 frame 的域名，默认值 *    

## iframeBridge实例 API
        
### bind(name, handler) / on(name, handler)
监听 iframeBridge 实例 trigger 的事件 
* name: {string} 事件名称
* handler: {function} 回调函数

### unbind(name, handler) / off(name, handler)
解除 bind / on 绑定的事件   

### once(name, handler)
同 bind / on，但只执行一次

### trigger(name, data)
触发事件

### request(name, success, error, detail, options)
请求 iframeBridge 端提供的方法

* name: {string} 方法名称
* success: function (data) {} 成功回调
<br/>
data: 不同的接口对应不同的值
* error: function (err) {} 失败回调
<br/>
err.code: 异常code 
<br/>
err.msg: 异常信息 
* options: 配置项，不同的接口对应不同的配置项

### respond(name, func)
响应 iframeBridge 端发出的请求

* name: {string} 请求名称
* func: function (resolve, reject, detail) {} 处理响应



