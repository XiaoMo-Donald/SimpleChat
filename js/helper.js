(function($) {
    $.fn.wysiwygEvt = function() {
        return this.each(function() {
            var $this = $(this);
            var htmlold = $this.html();
            var _lock = false;
            // $this.bind('blur keyup paste copy cut mouseup', function() {
            $this.bind('blur keyup mouseup', function() {
                var htmlnew = $this.html();
                // if (htmlold !== htmlnew) {
                //     $this.trigger('change')
                // }

                if (!_lock || htmlnew !== '') {
                    $this.trigger('change');
                }
                if (htmlnew === '') {
                    _lock = true;
                } else {
                    _lock = false;
                }
            })
        })
    }
})(jQuery);
/**
 * 调用
 * $(ele).wysiwygEvt();
 * $(ele).on('change', function(e) {});
 */




/** 数据存储 */
const storage = {
    get: function(key) {
        return JSON.parse(localStorage.getItem(key));
    },
    set: function(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    del: function(key) {
        localStorage.removeItem(key);
    }
};

/** 聊天好友面板设置 */
const chatSetting = {
    options: {
        fontColor: '#ffffff', //文字颜色
        bgColor: '#ff80ab', //背景颜色
        panelOpacity: 0.9, //窗口主内容透明度
        listAccordion: false, //是否启用列表手风琴效果
        skin: {
            id: 0,
            src: ''
        }, //皮肤 
        live2d: true, // 是否显示宠物
    },
    live2dIsShow: false, //标记宠物是否已经显示
    get: function() {
        return storage.get('chatSettings');
    },
    set: function(options) {
        var _options = this.get(),
            _newOptions;
        if (_options === null) {
            _newOptions = $.extend(this.options, options);
        } else {
            _newOptions = $.extend(_options, options);
        }
        storage.set('chatSettings', _newOptions);
        this.render();
    },
    default: function() {
        this.set({
            fontColor: '#ffffff', //文字颜色
            bgColor: '#ff80ab', //背景颜色
            panelOpacity: 0.9, //窗口主内容透明度
            listAccordion: false, //是否启用列表手风琴效果
            skin: {
                id: 0,
                src: ''
            }, //默认皮肤
            live2d: true, // 是否显示宠物
        });
    },
    render: function() {
        var _options = this.get();
        console.log(_options)
        if (_options !== null) {
            if (_options.listAccordion) {
                $("#UserFriendsList").attr('lay-accordion', '');
            } else {
                $("#UserFriendsList").removeAttr('lay-accordion');
            }
            $('.panel-body-tab').css('background-color', `rgba(255, 255, 255, ${_options.panelOpacity})`);
            $('.chat-panel-foot').css('background-color', `rgba(255, 255, 255, ${_options.panelOpacity})`);
            $('.chat-panel-foot').css('border-color', `rgba(242, 242, 242, ${_options.panelOpacity})`);
            $('.chat-window .layui-layer-content').css('background-color', `rgba(255, 255, 255, ${_options.panelOpacity})`);
            $('#ChatSetting').parent().find('.layui-layer-title').css({
                'color': _options.fontColor,
                'background-color': _options.bgColor
            });

            $('#ChatPanelSearchUsersAndGroups').parent().find('.layui-layer-title,.layui-tab-title,.chatpanelsearch-user-btn,.recommend-item-add-group-btn').css({
                'color': _options.fontColor,
                'background-color': _options.bgColor
            });
            $('#ChatPanelSearchUsersAndGroups').parent().find('.layui-this').css('color', _options.fontColor);
            $('#ChatPanelSearchUsersAndGroups').parent().find('.toggle-recommend').css('color', _options.bgColor);

            $('#ChatPanelSearchUsersAndGroups').find('.recommend-item-add-friend-btn,.chatpanelsearch-group-btn').css('background-color', _options.bgColor);


            $("#ChatOpenPanelContent").css('background-image', `url(${_options.skin.src})`);

            // if (_options.live2d) {
            //     if (!this.live2dIsShow) {
            //         this.live2dIsShow = true;
            //         setTimeout(function() {
            //             $('#landlord').fadeIn(200);
            //         }, 1300);

            //         setTimeout(function() {
            //             loadlive2d("live2d", message_Path + "model/histoire/model.json");
            //         }, 1000);
            //         initLive2d();
            //     }
            // } else {
            //     this.live2dIsShow = false;
            //     $('#landlord').fadeOut(200);
            // }
        }
    },
    init: function() {
        if (this.get() === null) {
            this.default();
        } else {
            this.render();
        }

    }
};


chatSetting.init();