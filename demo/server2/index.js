(function() {
    function write_event_log (name, type)
    {
        var now = new Date();
        var time = now.toLocaleString();
        name = '<b class="color-red">' + name + '</b>';
        log.innerHTML += '<br/>' + time + '<br/>: ' + type + ' ' + name;
    }
    var log = document.getElementById('log');

    var btn1 = document.getElementById('btn1');
    var btn2 = document.getElementById('btn2');

    var bridge = iframeBridge(window.parent.frames['server1']);

    btn1.onclick = function ()
    {
        bridge.request('food', function (data)
        {
            alert(JSON.stringify(data));
            write_event_log('request server1 food error success', 'request');
        }, function (err)
        {
            alert('request server1 food error');
        }, {type: 'fruit'});
    };

    btn2.onclick = function ()
    {
        bridge.trigger('event1', {key: 'value'});
    };

    bridge.on('event2', function ()
    {
        write_event_log('event2', 'event');
    });

    bridge.respond('req1', function (detail, resolve, reject)
    {
        if (detail)
        {
            resolve({key: 'value'});
        }
        else
        {
            reject({msg: 'err'});
        }
    });
})();