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
        listAccordion: false, //是否启用列表手风琴效果
        skin: '', //皮肤路径
    },
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
        storage.set('chatSettings', _options);
        this.render();
    },
    default: function() {
        this.set({
            listAccordion: false, //是否启用列表手风琴效果
            skin: '', //默认皮肤
        });
    },
    render: function() {
        var _options = this.get();
        console.log(_options);
        if(_options!==null){ 
            if (_options.listAccordion) {
                $("#UserFriendsList").attr('lay-accordion', '');
            } else {
                $("#UserFriendsList").removeAttr('lay-accordion');
            }
            $("#ChatOpenPanelContent").css('background-image', `url(${_options.skin})`);
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
