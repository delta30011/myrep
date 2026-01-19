(function($) {
    var prefix = '__widget_',
        $body = $(document.body),
        $w = $(window);

    var _widgets = {
        __widget_bar:{
            url:'',
            searchurl:'',
            sitemapurl:'',
            init:function() {
                this.$container = $('<div class="__widget_bar_container"/>').prependTo($(document.body).addClass('__widget_bar_active'));
                $('<iframe src="'+this.url+'" name="__widget_bar_frame"/>').appendTo(this.$container);
            },
            onmessage:function(action,data) {

                switch (action) {
                    case 'toggle_bar':
                        var toggle = (data && data.toggle != null) ? data.toggle : !$body.hasClass('__widget_bar_open')
                        $body.toggleClass('__widget_bar_open', toggle);
                    break;

                    case 'toggle_easy':
                        toggle_easy();
                    break;

                    case 'navigate':
                        if (data && data.url) {
                            document.location.href = (this[data.url]) ? this[data.url] : data.url;
                        }
                    break;

                    case 'search':
                        data && $('<form action="'+(data.searchurl||this.searchurl)+'" method="'+(data.method||'')+'" style="display:none">'+
                                    '<input type="hidden" name="searchid" value="'+data.searchid+'"/>'+
                                    '<input type="hidden" name="text" value="'+data.text+'"/>'+
                                '</form>').appendTo(document.body)[0].submit();
                    break;
                };

                return (true);
            }
        }
    }


    $w
        .on('message', function (ev) {

            ev = ev.originalEvent;

            var source = ev.source;
            if(!source===window) {
                return;// same window
            }

            var host = null;
            var strData = (ev.data+'');
            var j = strData.indexOf('//');
            if(j !== -1) {
                // host specified
                host = strData.substr(0, j);
                strData = strData.substr(j + 2);
            }

            if(!host) {
                // messages without host is now deprecated
                return;
            }

            var i = strData.indexOf(':');
            var action = i === -1 ? strData : strData.substr(0, i);
            if(!action) return; // no action specified
            if(action.indexOf('__') === 0) return; // system message

            var data = i === -1 ? null : strData.substr(i+1);
            if( data ) {
                try {data = $.parseJSON(data)}
                catch(e) {
                    console.log('cannot parse json data from message event: ', e.message, "\n", data);
                    return false;
                }
            }

            _widgets[host] && _widgets[host].onmessage && _widgets[host].onmessage.apply(_widgets[host],[action,data]);
        });


    window.__initWidgets = function(g, id, opts) {


    if (!id) return (false);

    if (!$) {
        console.log('---- '+id+'requires jQuery !');
        return (false);
    }
    window[g] = window[g] || {};

    var obj = _widgets['__widget_'+id] || null;

    if (obj) {
        $.extend(obj, opts || {})
        obj.init && obj.init.apply(obj);

    }

    window[g]['__widget_'+id] = obj;

    window[g].postMessage = function(widget, key, data) {
            if (!widget) return;
            var res = [widget + '//' + key];
            if (typeof(data) === 'string') data = {message: data};
            if (!$.isPlainObject(data)) data = {};
            if ($.isPlainObject(data)) {
                res.push(JSON.stringify(data));
            }

            window.frames[widget+'_frame'].postMessage(
                res.join(':'),
                '*'
            );
    }

    return (window[g]);
}
})(window.jQuery)