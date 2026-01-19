function getParent() {
    return window.opener || window.parent;
}

function sendMessage(key, data, isGlobal) {
    var parent = getParent();
    if (!parent) return;
    var res = ['__widget_bar' + '//' + key];
    if (typeof(data) === 'string') data = {message: data};
    if (isGlobal && !$.isPlainObject(data)) data = {};
    if ($.isPlainObject(data)) {
        if( isGlobal ) data.__global = true;
        res.push(JSON.stringify(data));
    }
    parent.postMessage(
        res.join(':'),
        '*'
    );
}

$(window)
    .on('message', function (ev) {

        ev = ev.originalEvent;

        var source = ev.source;
        if (!source === window) {
            return;// same window
        }

        //console.info('api message origin: ' + ev.origin);

        // string data
        var strData = (ev.data + '');

        // cut-out host
        strData = strData.split('//').pop();

        // split action key and json data
        var i = strData.indexOf(':');
        var action = i === -1 ? strData : strData.substr(0, i);
        if (!action) {
            return; // no data specified
        }

        var data = i === -1 ? null : strData.substr(i + 1);
        if (data) {
            try {
                data = $.parseJSON(data)
            }
            catch (e) {
                window.console
                && console.error
                && console.error('cannot parse json data from message event: ', e.message, "\n", data);
                return false;
            }
        }

        switch (action) {
            case 'switchTheme':
                //location.reload();
                var $css = $('.spec_css');
                if (data) {
                    document.body.className=  document.body.className.replace(/(theme\d)|(font\d)|(kern\d)|(noimages)/g,'').replace(/\s*$/,'') + ' ' + data.style;
                    (data.style === '') ? $css.remove() : $('<link href="styles/eeasy.css" ' + 'rel="stylesheet" type="text/css" media="screen" class="spec_css" />').appendTo(document.body);
                }

            break;
        }
    });


jQuery(function($) {
    var $body = $(document.body), items = ['main_menu2','main_search','lang','links_menu'], _toggleItems = function(not) {
        $.each(items,function(i,v) {
            if (v !== not) {$body.removeClass(v+'_open')} else {$body.toggleClass(v+'_open')};
            sendMessage('toggle_bar', {toggle:($body.prop('className').indexOf('_open')>-1)});
        })
    };
    $('.main_menu2')
        .on('click', '.sw',
        function(e) {
            _toggleItems('main_menu2');
            return (false);
    })
        /*.on('click', function(e) {e.stopPropagation();})*/
        .on('click', '.block', function(e) {window._menuclicked = true;})
        .on('mouseleave', '.block', function(e) {window._menuclicked = null;})
        .on('click','.nav-tabs a', function() {$(this).closest('.block').addClass('lev2')})
        .on('click','h3', function() {$(this).closest('.block').removeClass('lev2')});

    $('.links_menu')
        .on('click', '.sw',
            function(e) {
                _toggleItems('links_menu');
                return (false);
            })


    $('.main_search')
        .on('click', '.sw',
            function(e) {
                _toggleItems('main_search')
                return (false);
    })
        .on('click', function(e) {e.stopPropagation();})
        .on('submit', function(e) {
            e.preventDefault();
            var text = $(this).find(':text').val();
            text != '' &&sendMessage('search',{text:text, searchid:$(this).data('searchid'), searchurl:$(this).attr('action'), method:$(this).attr('method').toLowerCase()})
        })

    $('.lang')
        .on('click', '.sw',
            function(e) {
                _toggleItems('lang')
                return (false);

    })
        .on('click', 'a[href]', function(e) {sendMessage('navigate', {url:this.href}); e.stopPropagation();})
        .on('click', function(e) {e.stopPropagation();})

    $('.site_map_link').on('click', function(e) {sendMessage('navigate', {url:this.href||'sitemapurl'}); return (false)})

    $('.btn-spec').on('click', function(e) {sendMessage('toggle_easy'); return (false)})


    $body.on('click', function() {
        if (!window._menuclicked) {
            _toggleItems();
        }
    })
})