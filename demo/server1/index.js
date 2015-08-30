(function() {
    function write_event_log (name, type)
    {
        var now = new Date();
        var time = now.toLocaleString();
        name = '<b class="color-red">' + name + '</b>';
        log.innerHTML += '<br/>' + time + ': <br/>' + type + ' ' + name;
    }
    var log = document.getElementById('log');

    var btn1 = document.getElementById('btn1');
    var btn2 = document.getElementById('btn2');

    var bridge = iframeBridge(window.parent.frames['server2']);

    btn1.onclick = function ()
    {
        bridge.request('alert', function ()
        {
            write_event_log('request server2 alert success', 'request');
        }, function (err)
        {
            alert('request server2 alert error' + JSON.stringify(err));
        }, 'some text from server1');
    };

    btn2.onclick = function ()
    {
        bridge.trigger('911', {key: 'value'});
    };

    bridge.on('110', function ()
    {
        write_event_log('110: the server2 has trigger 110', 'event');
    });

    bridge.respond('fruit', function (detail, resolve, reject)
    {
        if (detail === 'apple')
        {
            resolve({name: 'apple', num: 1});
        }
        else
        {
            reject({msg: 'err'});
        }
    });

})();