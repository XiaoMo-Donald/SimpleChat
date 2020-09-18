(function() {
    'use strict';
    const TzChatPanel = function(options) {
        //TzChatPanel(options||{}) 或者 new TzChatPanel(options||{})都可以使用 TzChatPanel 方法
        if (!(this instanceof TzChatPanel)) { return new TzChatPanel(options); }
        // 参数合并 extend方法体在下面
        this.options = this.extend({
            debug: false, //开启调试模式
            button: '', //切换按钮容器
            apis: {
                ChatHubUrl: '', //Signalr Hub地址
                GetSettings: '', //获取聊天面板设置
                SaveSettings: '', //保存聊天面板设置
                GetSkins: '', //皮肤数据源
                UploadSkin: '', //上传皮肤
                DeleteSkin: '', //删除自定义皮肤
                GetFriends: '', //好友列表
                GetGroups: '', //群聊列表
                GetMsglist: '', //消息列表 
                ClearMsglist: '', //清空消息列表
                PanelSearch: '', //好友面板搜索
                ClearPanelSearch: '', //清空好友列表面板搜索记录
                AddFriend: '', //添加好友
                DeleteFriend: '', //删除好友 
                UpdateFriendNickname: '', //修改好友昵称
                AddFriendToFriendGroup: '', //添加好友到分组
                MoveFriendToFriendGroup: '', //移动好友到分组
                AddFriendGroup: '', //添加好友分组
                DeleteFriendGroup: '', //删除好友分组
                AddGroup: '', //添加群聊(创建群聊)
                DeleteGroup: '', //删除群聊
                GetMsgBox: '', //消息盒子列表
                SaveMsgBoxAgree: '', //消息盒子同意
                SaveMsgBoxRefuse: '', //消息盒子拒绝

            }
        }, options);
        this.init(); //初始化  
    };


    layui.use(['element', 'layer', 'jquery', 'form', 'flow', 'upload', 'laypage', 'colorpicker', 'slider', 'tree', 'util'], function() {
        let element = layui.element,
            flow = layui.flow,
            form = layui.form,
            layer = layui.layer,
            laypage = layui.laypage,
            $ = layui.jquery,
            colorpicker = layui.colorpicker,
            slider = layui.slider,
            tree = layui.tree,
            util = layui.util,
            upload = layui.upload;

        let _lock = false; //全局请求锁
        let _timer = null; //全局TimeOut 
        let _apiBaseUrl = 'https://www.fastmock.site/mock/992387632827a42b26d0a126c2acdea5/ChatPages';

        TzChatPanel.prototype = {
            /**
             * 扩展合并参数
             * @param {any} obj 参数对象数据源
             * @param {any} obj2 参数对象数据源
             * @returns {any} 合并后的新的参数对象 
             */
            extend: function(obj, obj2) { // 参数合并方法体
                for (var key in obj2) {
                    obj[key] = obj2[key];
                }
                return obj;
            },
            init: function() {

                _TzRequestEvents.test();

                console.log('%c  —————————————————————————————————', 'color:#FFB800')
                console.log('%c 丨 作者：提拉米苏的呆猫（Evan Mo）  丨', 'color:#009688')
                console.log('%c 丨 E-Mail：tzxiaomo@outlook.com   丨', 'color:#01AAED')
                console.log('%c 丨 WebSite：http://www.925i.cn    丨', 'color:#FF5722')
                console.log('%c  —————————————————————————————————', 'color:#FFB800')
                console.log("    ");
                console.log('%c 聊天面板初始化成功', 'color:#009688');
                console.log('%c 运行时间：' + _datetimeUtils.formatFullTime(new Date()), 'color:#009688');

                console.log("    ");
                if (this.options.debug) {
                    console.warn('Debug：调试模式已经打开，面板已自动展开。');
                    console.log("    ");

                    // _settingPanel.show();
                    _chatWindowEvents.ShowMultiplesWindowPanel('99999999', {
                        groupid: '99999999',
                        name: '群聊，调试测试'
                    });
                }
                _chatPanelEvents.init(this.options);
                // _chatPanelEvents.toggleBtn(this.options);
            }
        };

        /** 请求事件 */
        const _TzRequestEvents = {
            timer: null,
            /** 封装的 Promise 请求 */
            request: function(optinos) {
                let _options = {
                    url: '',
                    type: 'POST',
                    data: {},
                    dataType: 'json'
                };
                $.extend(_options, optinos);
                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: _apiBaseUrl + _options.url,
                        type: _options.type,
                        data: _options.data,
                        dataType: _options.dataType,
                        success: function(res) {
                            resolve(res)
                        },
                        fail: function(err) {
                            reject(err)
                        }
                    })
                })
            },
            test: function() {

                _TzRequestEvents.request({
                    url: 'https://www.fastmock.site/mock/992387632827a42b26d0a126c2acdea5/ChatPages/api/SearchGroupMember',
                    type: 'POST',
                    dataType: 'json',
                }).then(res => {
                    // console.log('Promise:');
                    // console.log(res);
                }).catch(err => {
                    console.log(err);
                })
            }
        };


        /** 面板事件 */
        const _chatPanelEvents = {
            isShow: false,
            isShowUtils: false,
            closeAllIndex: 0,
            panelIndex: 0,
            lock: false,
            timer: null,
            panelTemplate: function() {
                return `
                <div class="evan-chat-open-panel">
                <div class="chat-open-panel-content" id="ChatOpenPanelContent"> 
                    <div class="chat-panel-tool-btns">
                        <div class="layui-btn-group">
                            <button type="button" class="layui-btn layui-btn-primary layui-btn-xs chat-panel-tool-min-btn" title="最小化">
                                <i class="layui-icon layui-icon-subtraction"></i>
                            </button>
                            <button type="button" class="layui-btn layui-btn-primary layui-btn-xs chat-panel-tool-close-btn" title="关闭">
                                <i class="layui-icon layui-icon-close"></i>
                            </button>
                        </div>
                    </div>
                    <div class="chat-panel-head layui-layer-title">
                        <div class="panel-head-left">
                            <img class="panel-head-avatar" src="images/avatar/avatar_001.png" alt="">
                        </div>
                        <div class="panel-head-right">
                            <div class="panel-head-nickname">
                                <h5>提拉米苏的呆猫</h5>
                            </div>
                            <div class="panel-head-description" title="成功捕获一只正在Coding的呆猫">
                                成功捕获一只正在Coding的呆猫！
                            </div>
                        </div>
                    </div>
                    <div class="chat-panel-body"> 
                        <div class="panel-body-search">
                            <i class="layui-icon layui-icon-search panel-search-icon"></i>
                            <input type="text" name="SearchKey" maxlength="20" title="搜索好友、群聊" placeholder="搜索好友、群聊..." autocomplete="off" class="layui-input">
                            <i class="layui-icon layui-icon-close panel-search-clear-icon" title="取消"></i>
                        </div>
                        <div class="panel-body-search-result">
                            <ul class="search-result-groups">
                                <li class="search-result-group search-result-group-norecord layui-text-center">
                                    暂无搜索记录
                                </li>
                                <li class="search-result-group">
                                    <h5 class="layui-text-color-grey">好友</h5>
                                    <ul>
                                        <li class="layui-row chat-panel-search-item" data-objectid="111" data-type="friend">
                                            <div class="layui-col-xs2">
                                                <img src="../images/avatar/avatar_002.png" alt="">
                                            </div>
                                            <div class="layui-col-xs10">
                                                <h5>粉丝1号</h5>
                                                <p>来自：我的好友</p>
                                            </div>
                                        </li>
                                        <li class="layui-row chat-panel-search-item" data-objectid="222" data-type="friend">
                                            <div class="layui-col-xs2">
                                                <img src="../images/avatar/avatar_004.png" alt="">
                                            </div>
                                            <div class="layui-col-xs10">
                                                <h5>粉丝2号</h5>
                                                <p>共1000人</p>
                                            </div>
                                        </li>
                                    </ul>
                                </li>
                                <li class="search-result-group">
                                    <h5 class="layui-text-color-grey">群聊</h5>
                                    <ul>
                                        <li class="layui-row chat-panel-search-item" data-objectid="333" data-type="group">
                                            <div class="layui-col-xs2">
                                                <img src="../images/avatar/avatar_001.png" alt="">
                                            </div>
                                            <div class="layui-col-xs10">
                                                <h5>群大大二颜的粉丝1群</h5>
                                                <p>共900人</p>
                                            </div>
                                        </li>
                                        <li class="layui-row chat-panel-search-item" data-objectid="444" data-type="group">
                                            <div class="layui-col-xs2">
                                                <img src="../images/avatar/avatar_002.png" alt="">
                                            </div>
                                            <div class="layui-col-xs10">
                                                <h5>群大大二颜的粉丝2群</h5>
                                                <p>共1000人</p>
                                            </div>
                                        </li>
                                    </ul>
                                </li>
                            </ul> 
                        </div>
                        <div class="layui-tab layui-tab-brief panel-body-tab" lay-filter="docDemoTabBrief">
                            <ul class="layui-tab-title">
                                <li class="panel-friends layui-this" data-target="PanelFriends">我的好友
                                    <div class="panel-add-btns">
                                        <div class="add-friend-group-btn" data-type="AddFriend">
                                            <i class="layui-icon ">&#xe608;</i> 添加好友
                                        </div>
                                        <div class="add-friend-group-btn" data-type="AddFriendGroup">
                                            <i class="layui-icon ">&#xe608;</i> 添加分组
                                        </div>
                                    </div>
                                </li>
                                <li class="panel-groups" data-target="PanelGroups">群聊
                                    <div class="panel-add-btns">
                                        <div class="add-friend-group-btn" data-type="AddGroup">
                                            <i class="layui-icon ">&#xe608;</i> 创建群聊
                                        </div> 
                                    </div>
                                </li>
                                <li class="panel-msglist" data-target="PanelMsglist">消息
                                    <div class="panel-add-btns">
                                        <div class="add-friend-group-btn" data-type="ClearMsglist">
                                            <i class="layui-icon ">&#x1006;</i> 清空消息
                                        </div> 
                                    </div>
                                </li>
                            </ul>
                            <div class="layui-tab-content">
                                <div class="layui-tab-item layui-show panel-body-friends-item">
                                    <div class="layui-collapse" id="UserFriendsList" lay-accordion>
                                        <div class="layui-colla-item">
                                            <h2 class="layui-colla-title">新朋友 <span class="chat-user-friend-count">(2/30)</span></h2>
                                            <div class="layui-colla-content chat-panel-user-list layui-show ">
                                                <div class="chat-panel-user-item" data-userid="" title="用户昵称">
                                                    <div class="panel-user-left">
                                                        <img class="avatar" src="images/avatar/avatar_002.png" alt="">
                                                    </div>
                                                    <div class="panel-user-right">
                                                        <h3>用户的备注(<span>用户昵称啦</span>)</h3>
                                                        <p>这是用户的个性签名啦~~~~~~~~</p>
                                                    </div>
                                                </div>
                                                <div class="chat-panel-user-item" data-userid="" title="用户昵称">
                                                    <div class="panel-user-left">
                                                        <img class="avatar" src="images/avatar/avatar_003.png" alt="">
                                                    </div>
                                                    <div class="panel-user-right">
                                                        <h3>用户的备注(<span>用户昵称啦</span>)</h3>
                                                        <p>这是用户的个性签名啦~~~~~~~~</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="layui-colla-item">
                                            <h2 class="layui-colla-title">我的同学 <span class="chat-user-friend-count">(2/30)</span></h2>
                                            <div class="layui-colla-content chat-panel-user-list">
                                                <div class="chat-panel-user-item" data-userid="" title="用户昵称">
                                                    <div class="panel-user-left">
                                                        <img class="avatar" src="images/avatar/avatar_004.png" alt="">
                                                    </div>
                                                    <div class="panel-user-right">
                                                        <h3>用户的备注(<span>用户昵称啦</span>)</h3>
                                                        <p>这是用户的个性签名啦~~~~~~~~</p>
                                                    </div>
                                                </div>
                                                <div class="chat-panel-user-item" data-userid="" title="用户昵称">
                                                    <div class="panel-user-left">
                                                        <img class="avatar" src="images/avatar/avatar_005.png" alt="">
                                                    </div>
                                                    <div class="panel-user-right">
                                                        <h3>用户的备注(<span>用户昵称啦</span>)</h3>
                                                        <p>这是用户的个性签名啦~~~~~~~~</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="layui-colla-item">
                                            <h2 class="layui-colla-title">我的老师 <span class="chat-user-friend-count">(2/30)</span></h2>
                                            <div class="layui-colla-content chat-panel-user-list">
                                                <div class="chat-panel-user-item" title="用户昵称" data-userid="">
                                                    <div class="panel-user-left">
                                                        <img class="avatar" src="images/avatar/avatar_006.png" alt="">
                                                    </div>
                                                    <div class="panel-user-right">
                                                        <h3>用户的备注(<span>用户昵称啦</span>)</h3>
                                                        <p>这是用户的个性签名啦~~~~~~~~</p>
                                                    </div>
                                                </div>
                                                <div class="chat-panel-user-item" data-userid="" title="用户昵称">
                                                    <div class="panel-user-left">
                                                        <img class="avatar" src="images/avatar/avatar_007.png" alt="">
                                                    </div>
                                                    <div class="panel-user-right">
                                                        <h3>用户的备注(<span>用户昵称啦</span>)</h3>
                                                        <p>这是用户的个性签名啦~~~~~~~~</p>
                                                    </div>
                                                </div>
                                                <div class="chat-panel-user-item" data-userid="" title="用户昵称">
                                                    <div class="panel-user-left">
                                                        <img class="avatar" src="images/avatar/avatar_007.png" alt="">
                                                    </div>
                                                    <div class="panel-user-right">
                                                        <h3>用户的备注(<span>用户昵称啦</span>)</h3>
                                                        <p>这是用户的个性签名啦~~~~~~~~</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="layui-tab-item panel-body-group">
                                    群聊分组
                                </div>
                                <div class="layui-tab-item panel-body-msglist">
                                    消息列表
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chat-panel-foot">
                        <div class="layui-btn-group">
                            <button type="button" title="菜单" class="layui-btn panel-foot-func-btn" data-funcid="menu">
                                <i class="layui-icon layui-icon-spread-left"></i>
                            </button>
                            <button type="button" title="设置" class="layui-btn panel-foot-func-btn" data-funcid="setting">
                                <i class="layui-icon layui-icon-set-sm"></i>
                            </button>
                            <button type="button" title="添加好友" class="layui-btn panel-foot-func-btn" data-funcid="addfriend">
                                <i class="layui-icon layui-icon-add-circle"></i>
                            </button>
                            <button type="button" title="消息盒子" class="layui-btn panel-foot-func-btn" data-funcid="msgbox">
                                <i class="layui-icon layui-icon-dialogue"></i>
                            </button>
                            <button type="button" title="设置皮肤" class="layui-btn panel-foot-func-btn" data-funcid="skins">
                                <span class="iconfont icon-pifuguanli"></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
            },
            renderPanel: function() {
                if (!this.lock) {
                    this.lock = true;
                    this.togglePanel();
                    chatSetting.init();
                    chatPanel.init();
                    _bindEvents.init();
                    clearTimeout(this.timer);
                    this.timer = setTimeout(() => {
                        this.lock = false;

                        //绑定右键菜单：点击鼠标右键响应函数 
                        let _panelAddBtnsIsOpen = false;
                        $('#TzChatPanel').contextmenu(function(e) {
                            e.preventDefault()
                            let _$this = $(e.target);
                            if (_$this.hasClass('layui-this')) {
                                switch (_$this.data('target')) {
                                    case 'PanelFriends':
                                        console.log('好友')
                                        if (_panelAddBtnsIsOpen) {
                                            _$this.find('.panel-add-btns').fadeOut(10);
                                            _panelAddBtnsIsOpen = false;
                                        } else {
                                            _$this.find('.panel-add-btns').fadeIn(10);
                                            _panelAddBtnsIsOpen = true;
                                        }
                                        break;
                                    case 'PanelGroups':
                                        console.log('群聊')
                                        if (_panelAddBtnsIsOpen) {
                                            _$this.find('.panel-add-btns').fadeOut(10);
                                            _panelAddBtnsIsOpen = false;
                                        } else {
                                            _$this.find('.panel-add-btns').fadeIn(10);
                                            _panelAddBtnsIsOpen = true;
                                        }
                                        break;
                                    case 'PanelMsglist':
                                        console.log('消息')
                                        if (_panelAddBtnsIsOpen) {
                                            _$this.find('.panel-add-btns').fadeOut(10);
                                            _panelAddBtnsIsOpen = false;
                                        } else {
                                            _$this.find('.panel-add-btns').fadeIn(10);
                                            _panelAddBtnsIsOpen = true;
                                        }
                                        break;
                                }
                                _bindEvents.bindPanelTabsBtns();
                            }
                        })

                        $('.evan-chat-open-panel').off('click').on('click', function() {
                            $(this).find('.panel-add-btns').fadeOut(10);
                            _panelAddBtnsIsOpen = false;
                        });

                    }, 500)
                }
            },
            toggleBtn: function(options) {
                let _this = this;
                if (options.button !== '' && (options.button.indexOf('.') !== -1 || options.button.indexOf('#') !== -1)) {
                    $(options.button).off('click').on('click', function() {
                        _this.renderPanel();
                    });
                    if (document.querySelector('#OpenChatPanelBtn') === null) {
                        console.error(`检测到初始化配置错误：配置了切换按钮:${options.button}，但在页面中未找到该元素，这将会导致面板关闭后无法打开，默认配置了切换按钮，如不需要自定义，请不要配置以下配置项=> button:${options.button}`);
                    }
                } else {
                    let _toggleBtn = `
                        <div class="evan-chat-open-panel-btn">
                            <button type="button" class="layui-btn" id="OpenChatPanelBtn">展开面板</button>
                        </div>
                    `;
                    $('body').append(_toggleBtn);
                    $('#OpenChatPanelBtn').off('click').on('click', function() {
                        _this.renderPanel();
                    });
                }
                if (options.debug) {
                    _this.renderPanel();
                }
            },
            /** 切换面板显示隐藏 */
            togglePanel: function() {
                let _this = this;
                if (_this.isShow) {
                    layer.close(_this.panelIndex);
                    _this.isShow = false;
                    return;
                }
                $('.evan-chat-open-panel-btn').fadeOut(300);
                _this.isShow = true;
                _this.panelIndex = layer.open({
                    type: 1,
                    closeBtn: 0,
                    title: false,
                    offset: 'rb', //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
                    id: 'TzChatPanel', //防止重复弹出
                    content: _this.panelTemplate(),
                    shade: 0, //不显示遮罩
                    anim: 2,
                    success: function() {
                        $('button.chat-panel-tool-close-btn,button.chat-panel-tool-min-btn').off('click').on('click', function() {
                            layer.close(_this.panelIndex);
                            // _this.isShow = false;
                            $('.evan-chat-open-panel-btn').fadeIn(300);
                            // _this.showCloseAllBtn();
                        });
                        chatPanel.GetFriends();
                        _bindEvents.bindFootFuns();
                        // _this.showCloseAllBtn();
                    }
                });
            },
            showCloseAllBtn: function() {
                let _this = this;
                _this.closeAllIndex = layer.open({
                    type: 1,
                    id: 'EvanCloseAllChatWindows',
                    skin: 'evancloseall-chatwindows', //样式类名 
                    anim: 2,
                    resize: false,
                    area: ['300px', '60px'],
                    title: '窗口小工具',
                    shadeClose: false, //开启遮罩关闭
                    shade: 0,
                    zIndex: layer.zIndex,
                    content: `
                        <button class="layui-btn evan-close-all-chatwindows-btn" title="一键关闭所有聊天窗口" id="EvanCloseAllChatWindowsBtn">一键关闭所有聊天窗口</button>
                    `,
                    success: function(layero) {
                        $('#EvanCloseAllChatWindowsBtn').off('click').on('click', function(e) {
                            layer.closeAll();
                            _this.isShowUtils = false;
                            $('.evan-chat-open-panel-btn').fadeIn(300);
                        });
                    },
                    end: function() {
                        _this.isShow = false;
                        _this.isShowUtils = false;
                        // _this.showCloseAllBtn();
                    }
                });
            },
            /** 聊天面板搜索结果模板 */
            panelSearchTemplate: function(data) {
                let _template = '';
                if (data.count <= 0) {
                    _template = `
                    <li class="search-result-group search-result-group-norecord layui-text-center">
                        暂无搜索记录
                    </li>
                `;
                } else {
                    _template += `
                <li class="search-result-group">
                    <h5 class="layui-text-color-grey">好友</h5>
                    <ul>
                `;
                    data.data.users.forEach((item, index) => {
                        _template += `
                        <li class="layui-row chat-panel-search-item" title="${item.nickname}" data-objectid="${item.id}" data-type="friend">
                            <div class="layui-col-xs2">
                                <img src="${item.avatar}" alt="${item.nickname}">
                            </div>
                            <div class="layui-col-xs10">
                                <h5>${item.nickname}</h5>
                                <p>来自：${item.group.name}</p>
                            </div>
                        </li>
                    `;
                    })

                    _template += '</ul></li>';
                    _template += `
                    <li class="search-result-group">
                        <h5 class="layui-text-color-grey">群聊</h5>
                        <ul>
                    `;
                    data.data.groups.forEach((item, index) => {
                        _template += `
                        <li class="layui-row chat-panel-search-item" title="${item.name}" data-objectid="${item.id}" data-type="group">
                            <div class="layui-col-xs2">
                                <img src="${item.avatar}" alt="${item.name}">
                            </div>
                            <div class="layui-col-xs10">
                                <h5>${item.name}</h5>
                                <p>共${item.count}人</p>
                            </div>
                        </li>
                    `;
                    })

                    _template += '</ul></li>';
                    $('.search-result-groups').html(_template);
                    _bindEvents.bindSearchResultItem();
                }
            },
            showUtils: function() {
                let _this = this;

                $('#EvanChatPanelUtils').off('click').on('click', function(e) {
                    if (!_this.isShowUtils) {
                        _this.isShowUtils = true;
                        _this.showCloseAllBtn();
                    } else {
                        layer.close(_this.closeAllIndex);
                        _this.isShowUtils = false;
                    }
                });
            },
            init: function(optinos) {
                this.showUtils();
                this.toggleBtn(optinos);
            }
        };

        /** 聊天窗口模板 */
        const _chatWindowEvents = {
            lock: false,
            timer: null,
            GetSingleTemplate: function() {
                return `
                <div class="evan-chat-window">
                    <div class="chat-window-main">
                        <!-- <div class="chat-window-main-container"> -->
                            <ul class="chat-window-content single">
                            ${this.GetSingleMsgList()}
                            </ul>
                        <!-- </div> -->
                        <div class="chat-window-foot">
                            <div class="chat-window-foot-tools">
                                <div class="layui-row">
                                    <div class="layui-col-xs10">
                                        <div class="layui-btn-group left-btn-group">
                                            <button type="button" class="layui-btn" title="表情">
                                                <i class="layui-icon layui-icon-face-smile chat-window-emoji-btn"></i> 
                                            </button>
                                            <button type="button" class="layui-btn" title="发送图片">
                                                <i class="layui-icon layui-icon-picture chat-window-send-img-btn"></i>
                                            </button>
                                            <button type="button" class="layui-btn" title="发送视频">
                                                <i class="layui-icon layui-icon-video chat-window-send-video-btn"></i>
                                            </button>
                                            <button type="button" class="layui-btn" title="发送文件">
                                                <i class="layui-icon chat-window-send-file-btn"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="layui-col-xs2 layui-text-right">
                                        <div class="layui-btn-group chat-window-history-btns" data-times="">
                                            <button type="button" class="layui-btn chat-window-history-btn" title="历史记录">
                                                <i class="layui-icon layui-icon-time"></i> 
                                            </button>
                                            <button type="button" class="layui-btn chat-window-history-text" title="历史记录">
                                                历史记录
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <form class="layui-form chat-window-foot-send" action="">
                                <div class="chat-window-foot-text">
                                <!--<span class="send-message-text-input-tip">请说点什么吧...</span>
                                    <div  class="send-message-text-input" placeholder="" contenteditable="true"></div> -->
                                    <textarea class="send-message-text-input" rows="3" name="SendMessageText" placeholder="请输入内容"></textarea>  
                                </div>
                                <div class="chat-window-foot-btns layui-text-right">
                                    <button type="button" class="layui-btn layui-btn-sm chat-window-close-btn">关闭</button>
                                    <button type="button" class="layui-btn layui-btn-sm chat-window-send-btn">发送(<span>Enter</span>)</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div class="chat-window-group-users"> 
                        <div class="chat-window-group-users-count">群成员<span class="group-member-count">520/1314</span><span class="add-group-member" data-groupid="" title="邀请好友加入群聊"><i class="layui-icon layui-icon-add-1"></i>邀请好友</span></div>
                        <div class="chat-window-group-users-search">
                            <input type="text" title="搜索群成员" maxlength="20" placeholder="输入群员昵称/聊天号..." name="GroupUsersSearchInput">
                            <i class="layui-icon layui-icon-close group-users-search-clear-btn" title="清空搜索"></i>
                        </div>
                        <div class="chat-window-group-users-scroll">
                            <ul class="chat-window-group-users-list">
                            <!-- 
                                <li class="chat-window-group-users-item" title="群里的成员"> 
                                    <span class="group-users-item-identity creator">群主</span> 
                                    <img class="group-users-item-avatar" src="images/avatar/avatar_001.png" alt="头像"/>
                                    <h5 class="group-users-item-nickname">提拉米苏的呆猫</h5>
                                    <img class="group-users-item-identity creator" src="images/avatar/avatar_001.png" alt="头像"/> 
                                     <span class="group-users-item-identity creator">群主</span>
                                </li>
                            -->
                            </ul>
                        </div>
                    </div> 
                </div>
            `;
            },
            GetSingleMsgList: function() {
                let _msgTemplate = `
                    <li class="main-user-msg">
                        <img src="images/avatar/avatar_002.png" alt="">
                        <div class="main-user-msg-title"> 
                            <span class="nickname">小鱼呆猫儿</span>
                            <span class="send-msg-time">2020-02-01 20:07:59</span>
                        </div>
                        <div class="main-user-msg-content">你好呀，我是...你猜猜</div>
                    </li>
                    <li class="main-user-msg self">
                        <img src="images/avatar/avatar_001.png" alt="">
                        <div class="main-user-msg-title"> 
                            <span class="send-msg-time">2020-02-01 20:09:59</span>
                            <span class="nickname">提拉米苏的呆猫 </span>
                        </div>
                        <div class="main-user-msg-content">
                            <span  class="text-msg">你好呀，小呆猫儿...</span>
                            <img class="emoji" title="图片表情包" layer-src="http://chat-demo-pages.kuaiyunds.com/chat-demo-pages/groups/group_015.gif" src="http://chat-demo-pages.kuaiyunds.com/chat-demo-pages/groups/group_015.gif" alt="">
                        </div>
                    </li>
                    <li class="main-user-msg self">
                        <img src="images/avatar/avatar_001.png" alt="提拉米苏的呆猫">
                        <div class="main-user-msg-title"> 
                            <span class="send-msg-time">${_datetimeUtils.formatFullTime(new Date())}</span>
                            <span class="nickname">提拉米苏的呆猫</span>
                        </div>
                        <div class="main-user-msg-content"> 
                            <div class="video">
                                <video width="280" controls>
                                    <source src="../videos/demo_video_001.mp4"  type="video/mp4">
                                </video>
                            </div>
                        </div>
                    </li>
                    <!-- <li class="main-user-msg self">
                        <img src="images/avatar/avatar_001.png" alt="">
                        <div class="main-user-msg-title"> 
                            <span class="send-msg-time">2020-02-01 20:09:59</span>
                            <span class="nickname">提拉米苏的呆猫 </span>
                        </div>
                        <div class="main-user-msg-content">
                            <span class="text-msg">你好呀，小呆猫儿...</span>
                            <img class="image" title="图片名称" layer-src="../images/skins/skin_001.png" src="../images/skins/skin_001.png" alt="">
                        </div>
                    </li> -->
                    <li class="main-user-msg self">
                        <img src="images/avatar/avatar_001.png" alt="">
                        <div class="main-user-msg-title"> 
                            <span class="send-msg-time">2020-02-01 20:09:59</span>
                            <span class="nickname">提拉米苏的呆猫 </span>
                        </div>
                        <div class="main-user-msg-content">
                            <a href="javascript:" data-href="http://cloud.925i.cn" title="http://cloud.925i.cn">http://cloud.925i.cn</a>
                        </div>
                    </li> 
                    `;

                return _msgTemplate;
            },
            SendSingleMsg: function(t) {
                let _sendTemplate = `
                    <li class="main-user-msg self">
                        <img src="${t.user.avatar}" alt="${t.user.nickname}">
                        <div class="main-user-msg-title">
                            <span class="send-msg-time">${_datetimeUtils.formatFullTime(t.time)}</span>                            
                            <span class="nickname">${t.user.nickname}</span>
                        </div>
                        <div class="main-user-msg-content">
                            <span  class="text-msg">${t.content}</span>
                        </div>
                    </li>
                `;
                return _sendTemplate;
            },
            SendImageMsg: function(t) {
                // let _sendTemplate = `
                //     <li class="main-user-msg self">
                //         <img src="${t.user.avatar}" alt="${t.user.nickname}">
                //         <div class="main-user-msg-title"> 
                //             <span class="send-msg-time">${_datetimeUtils.formatFullTime(t.time)}</span>
                //             <span class="nickname">${t.user.nickname}</span>
                //         </div>
                //         <div class="main-user-msg-content"> 
                //             <img class="image" title="图片名称" layer-src="${t.src}" src="${t.src}" alt="">
                //              
                //         </div>
                //     </li>
                // `;
                let _sendTemplate = `
                <li class="main-user-msg self">
                    <img src="${t.user.avatar}" alt="${t.user.nickname}">
                    <div class="main-user-msg-title"> 
                        <span class="send-msg-time">${_datetimeUtils.formatFullTime(t.time)}</span>
                        <span class="nickname">${t.user.nickname}</span>
                    </div>
                    <div class="main-user-msg-content" id="${t.tempSendImageId}">
                        <span class="reupload-image"><i class="layui-icon layui-icon-refresh"></i></span>
                        <img class="image" title="图片名称"  alt="">
                        <div class="layui-progress send-image-progress">
                            <div class="layui-progress-bar send-image-progress-bar " lay-filter="SendImageProgress"></div>
                        </div>
                    </div>
                </li>
            `;
                return _sendTemplate;
            },
            SendVideoMsg: function(t) {
                let _sendTemplate = `
                    <li class="main-user-msg self">
                        <img src="${t.user.avatar}" alt="${t.user.nickname}">
                        <div class="main-user-msg-title"> 
                            <span class="send-msg-time">${_datetimeUtils.formatFullTime(t.time)}</span>
                            <span class="nickname">${t.user.nickname}</span>
                        </div>
                        <div class="main-user-msg-content"> 
                            <div class="video">
                                <video width="280" controls>
                                    <source src="${t.src}"  type="video/mp4">
                                </video>
                            </div>
                        </div>
                    </li>
                `;
                return _sendTemplate;
            },
            ReceiveSingleMsg: function(t) {
                let _receiveTemplate = `
                    <li class="main-user-msg">
                        <img src="${t.user.avatar}" alt="${t.user.nickname}">
                        <div class="main-user-msg-title"> 
                            <span class="nickname">${t.user.nickname}</span>
                            <span class="send-msg-time">${_datetimeUtils.formatFullTime(t.time)}</span>
                        </div>
                        <div class="main-user-msg-content">${t.content}</div>
                    </li>
                `;

                return _receiveTemplate;
            },
            /** 显示单人聊天窗口 */
            ShowSingleWindowPanel: function(userid, tempData) {
                let _this = this;
                // $.ajax({
                //     url: '/api/GetUserChatByUserId',
                //     type: 'POST',
                //     dataType: 'json',
                //     data: {
                //         UserId: userid
                //     },
                //     success: function(res) {
                //         console.log(res)
                //多窗口模式，层叠置顶
                let _index = layer.open({
                    id: 'ChatWindow' + userid,
                    skin: 'chat-window chatid-' + userid,
                    type: 1,
                    title: tempData.nickname,
                    area: [tempData.width || '700px', '589px'],
                    shade: 0,
                    maxmin: true,
                    resize: false,
                    offset: 'c',
                    content: _this.GetSingleTemplate(),
                    zIndex: layer.zIndex, //重点1 
                    success: function(layero) {
                        layer.setTop(layero); //重点2
                        //_bindEvents.renderScroll(); //加载自定义滚动条样式

                        let _chatSettings = chatSetting.get();
                        $(layero[0]).find('.layui-layer-content').css('background-color', `rgba(255, 255, 255, ${_chatSettings.panelOpacity})`);
                        //滚动到底部
                        $(layero[0]).find('.chat-window-main').css('width', '100%');
                        //$('.mCSB_container').css({ 'top': -($('.mCSB_container').prop("scrollHeight") - 400) });
                        $(layero[0]).find('.chat-window-content').animate({ scrollTop: $(layero[0]).find('.chat-window-content').prop("scrollHeight") + 50 }, 600);
                        // $(layero).find('.chat-window-main-container').animate({ scrollTop: $(layero).find('.chat-window-content').prop("scrollHeight") + 50 }, 3000);

                        $(layero[0]).css('background-image', `url(${chatSetting.get().skin})`);
                        //TODO:绑定各种按钮

                        $(layero[0]).find('.chat-window-history-btns').attr('data-chatid', userid);
                        $(layero[0]).find('.chat-window-close-btn').attr('data-chatid', userid);

                        $(layero[0]).find('.chat-window-close-btn').off('click').on('click', function() {
                            layer.close($(this).parent().parent().parent().parent().parent().parent().parent().attr('times'));
                        });
                        $(layero[0]).find('.chat-window-history-btns').off('click').on('click', function() {
                            // let _$parent = $(this).parent().parent().parent().parent().parent().parent().parent();
                            // let _historyPanel = _$parent.find('.chat-window-history');
                            // let _mainPanel = _$parent.find('.chat-window-main');
                            // let _parentContainer = _$parent.parent().parent();
                            // if (_historyPanel.hasClass('active')) {
                            //     _parentContainer.removeClass('show-history').addClass('hiden-history');
                            //     _mainPanel.css('width', '100%');
                            //     _historyPanel.removeClass('active');
                            // } else {
                            //     _parentContainer.removeClass('hiden-history').addClass('show-history');
                            //     _mainPanel.css('width', tempData.width);
                            //     _historyPanel.addClass('active')
                            // }
                            let _$this = $(this);
                            console.log($(_$this).data('chatid'))
                            console.log($(_$this).attr('times'))
                            if (_$this.attr('times') !== undefined) {
                                layer.close(_$this.attr('times'))
                            } else {
                                layer.open({
                                    type: 1,
                                    id: 'ChatHistory' + userid,
                                    skin: 'chat-history ' + userid,
                                    title: `与 小鱼呆猫儿 的聊天记录`,
                                    area: ['450px', '100%'],
                                    shade: 0,
                                    maxmin: false,
                                    resize: false,
                                    offset: 'rb',
                                    anim: 2,
                                    content: ` 
                                    <div class="chat-window-history-container">
                                        <div class="chat-window-history-search">
                                            <input type="text" name="HistorySearchKey" placeholder="关键字..." autocomplete="off" class="layui-input">
                                            <button type="button" class="layui-btn history-search-btn">搜索</button>
                                        </div> 
                                        <div class="chat-window-history-scroll"> 
                                            <ul class="chat-window-history-content single"> 
                                                <li class="main-user-msg">
                                                    <img src="images/avatar/avatar_002.png" alt="">
                                                    <div class="main-user-msg-title"> 
                                                        <span class="nickname">小鱼呆猫儿</span>
                                                        <span class="send-msg-time">2020-02-01 20:07:59</span>
                                                    </div>
                                                    <div class="main-user-msg-content">#qq_47#你好，我是小呆猫儿哟</div>
                                                </li>
                                                <li class="main-user-msg self">
                                                    <img src="images/avatar/avatar_001.png" alt="">
                                                    <div class="main-user-msg-title"> 
                                                        <span class="send-msg-time">2020-02-01 20:09:59</span>
                                                        <span class="nickname">提拉米苏的呆猫 </span>
                                                    </div>
                                                    <div class="main-user-msg-content">
                                                        <span  class="text-msg">你好呀，小呆猫儿...</span>
                                                        <img class="emoji" title="图片表情包" src="../images/avatar/avatar_004.png" alt="">
                                                    </div>
                                                </li>
                                                <li class="main-user-msg self">
                                                    <img src="images/avatar/avatar_001.png" alt="">
                                                    <div class="main-user-msg-title"> 
                                                        <span class="send-msg-time">2020-02-01 20:09:59</span>
                                                        <span class="nickname">提拉米苏的呆猫 </span>
                                                    </div>
                                                    <div class="main-user-msg-content">
                                                        <span  class="text-msg">你好呀，小呆猫儿...</span>
                                                        <img class="image" title="图片名称" src="../images/avatar/avatar_007.png" alt="">
                                                    </div>
                                                </li>
                                                <li class="main-user-msg self">
                                                    <img src="images/avatar/avatar_001.png" alt="">
                                                    <div class="main-user-msg-title"> 
                                                        <span class="send-msg-time">2020-02-01 20:09:59</span>
                                                        <span class="nickname">提拉米苏的呆猫 </span>
                                                    </div>
                                                    <div class="main-user-msg-content">
                                                        <a href="javascript:" data-href="http://cloud.925i.cn" title="http://cloud.925i.cn">http://cloud.925i.cn</a>
                                                    </div>
                                                </li> 
                                            </ul> 
                                        </div>
                                    </div> 
                                    `,
                                    zIndex: layer.zIndex, //重点1 
                                    success: function(layero2) {
                                        flow.load({
                                            elem: $(layero2[0]).find('.chat-window-history-content'), //流加载容器
                                            scrollElem: $(layero2[0]).find('.chat-window-history-scroll'), //滚动条所在元素，一般不用填，此处只是演示需要。
                                            isAuto: false,
                                            done: function(page, next) { //加载下一页
                                                //模拟插入
                                                let _template = `
                                                    <li class="main-user-msg">
                                                        <img src="images/avatar/avatar_002.png" alt="">
                                                        <div class="main-user-msg-title"> 
                                                            <span class="nickname">小鱼呆猫儿</span>
                                                            <span class="send-msg-time">2020-02-01 20:07:59</span>
                                                        </div>
                                                        <div class="main-user-msg-content">#qq_47#你好，我是小呆猫儿哟</div>
                                                    </li>
                                                    <li class="main-user-msg self">
                                                        <img src="images/avatar/avatar_001.png" alt="">
                                                        <div class="main-user-msg-title"> 
                                                            <span class="send-msg-time">2020-02-01 20:09:59</span>
                                                            <span class="nickname">提拉米苏的呆猫 </span>
                                                        </div>
                                                        <div class="main-user-msg-content">
                                                            <span  class="text-msg">你好呀，小呆猫儿...</span>
                                                            <img class="emoji" title="图片表情包" layer-src="../images/avatar/avatar_004.png" src="../images/avatar/avatar_004.png" alt="">
                                                        </div>
                                                    </li>
                                                `;
                                                setTimeout(() => {
                                                    var lis = [];
                                                    for (var i = 0; i < 6; i++) {
                                                        lis.push(_template);
                                                    }
                                                    next(lis.join(''), page < 6); //假设总页数为 6
                                                    _bindEvents.bindPreviewImages(layero2[0]);
                                                    _bindEvents.parseEmoji($(layero2[0]).find('.main-user-msg-content'));
                                                }, 500);
                                            }
                                        });

                                        _$this.attr('times', $(layero2[0]).attr('times'));
                                    },
                                    end: function() {
                                        _$this.removeAttr('times');
                                    }
                                })
                            }
                        });

                        let locktime = 500;
                        $(layero[0]).find('.chat-window-send-btn').off('click').on('click', function() {
                            let _$msgText = $(this).parent().parent().find('textarea[name=SendMessageText]'),
                                _$msgLiscontainer = $(this).parent().parent().parent().parent().parent().find('.chat-window-content');
                            if (!_this.lock) {
                                _this.lock = true;

                                if (_$msgText.val().trim() !== '') {

                                    _$msgLiscontainer.append(_this.SendSingleMsg({
                                        user: {
                                            nickname: '提拉米苏的呆猫',
                                            avatar: 'images/avatar/avatar_001.png'
                                        },
                                        content: _$msgText.val(),
                                        time: new Date()
                                    }));
                                    _$msgText.val('');
                                    _$msgText.text('');
                                    _bindEvents.parseEmoji($(layero[0]).find('.main-user-msg-content'));
                                    _$msgLiscontainer.animate({ scrollTop: _$msgLiscontainer.prop("scrollHeight") }, 10);

                                }
                                clearTimeout(_this.lock);
                                _this.lock = setTimeout(() => {
                                    _this.lock = false;
                                }, locktime)
                            }
                            // let _$msgText = $(this).parent().parent().find('.send-message-text-input'),
                            //     _$msgLiscontainer = $(this).parent().parent().parent().parent().parent().find('.chat-window-content');
                            // if (_$msgText.val().trim() !== '') {
                            //     _$msgLiscontainer.find('.mCSB_container').append(_this.SendSingleMsg({
                            //         // content: _$msgText.html(),
                            //         content: _$msgText.val().trim(),
                            //         time: new Date()
                            //     }));
                            //     _bindEvents.parseEmoji('.main-user-msg-content');
                            //     _$msgText.val('');

                            //     _$msgLiscontainer.find('.mCSB_container').css({ 'top': -(_$msgLiscontainer.find('.mCSB_container').prop("scrollHeight") - 400) });
                            // }
                        });
                        $(layero[0]).find('textarea[name=SendMessageText]').keypress(function(e) {　
                            if (!_this.lock) {
                                _this.lock = true;
                                if (e.keyCode == 13) {　　
                                    e.preventDefault();　　
                                    let _$msgText = $(this).val(),
                                        _$msgLiscontainer = $(this).parent().parent().parent().parent().find('.chat-window-content');
                                    if (_$msgText.trim() !== '') {
                                        _$msgLiscontainer.append(_this.SendSingleMsg({
                                            user: {
                                                nickname: '提拉米苏的呆猫',
                                                avatar: 'images/avatar/avatar_001.png'
                                            },
                                            content: _$msgText,
                                            time: new Date()
                                        }));
                                        $(this).val('');
                                        $(this).text('');
                                        _bindEvents.parseEmoji($(layero[0]).find('.main-user-msg-content'));
                                        _$msgLiscontainer.animate({ scrollTop: _$msgLiscontainer.prop("scrollHeight") }, 10);
                                    }
                                }
                                clearTimeout(_this.lock);
                                _this.lock = setTimeout(() => {
                                    _this.lock = false;
                                }, locktime);
                            }
                        });
                        // $('.send-message-text-input').keypress(function(e) {　　
                        //     if (e.keyCode == 13) {　　　　
                        //         let _$msgText = $(this).val(),
                        //             _$msgLiscontainer = $(this).parent().parent().parent().parent().find('.chat-window-content');
                        //         if (_$msgText.trim() !== '') {
                        //             _$msgLiscontainer.find('.mCSB_container').append(_this.SendSingleMsg({
                        //                 content: _$msgText.trim(),
                        //                 time: new Date()
                        //             }));
                        //             $(this).val('');
                        //             _$msgLiscontainer.find('.mCSB_container').css({ 'top': -(_$msgLiscontainer.find('.mCSB_container').prop("scrollHeight") - 400) });
                        //         }
                        //     }
                        // });

                        _bindEvents.renderEmoji({
                            container: $(layero[0]).find(".send-message-text-input"),
                            button: $(layero[0]).find('.chat-window-emoji-btn')
                        });

                        _bindEvents.bindChatWindowTools(layero);

                        // 模拟接收信息
                        let _IntervalCount = 0;
                        let _interval = setInterval(function() {
                            if (_IntervalCount >= 1) {
                                clearInterval(_interval);
                            }
                            _IntervalCount++;
                            let _$msgLiscontainer = $(layero[0]).find(".chat-window-content");
                            _$msgLiscontainer.append(_this.ReceiveSingleMsg({
                                user: {
                                    nickname: '小鱼呆猫儿',
                                    avatar: 'images/avatar/avatar_002.png'
                                },
                                content: '#qq_1#主人不在，可能正在忙碌呢~',
                                time: new Date()
                            }))
                            _bindEvents.parseEmoji($(layero[0]).find('.main-user-msg-content'));
                            _bindEvents.bindPreviewImages(layero);
                            _$msgLiscontainer.animate({ scrollTop: _$msgLiscontainer.prop("scrollHeight") }, 10);

                        }, Math.floor(Math.random() * 10) * 1000);
                        _bindEvents.bindPreviewImages(layero);

                    }
                });

                //     },
                //     fail: function() {
                //         console.log('请求错误！')
                //     }
                // })
            },
            ShowMultiplesWindowPanel: function(groupid, tempData) {
                let _this = this;
                // $.ajax({
                //     url: '/api/GetGroupChatById',
                //     type: 'POST',
                //     dataType: 'json',
                //     data: {
                //         GroupId: groupid
                //     },
                //     success: function(res) {
                //         console.log(res)
                //多窗口模式，层叠置顶
                layer.open({
                    id: 'ChatWindow' + groupid,
                    skin: 'chat-window chatid-' + groupid,
                    type: 1,
                    title: tempData.name,
                    area: [tempData.width || '940px', '589px'],
                    shade: 0,
                    maxmin: true,
                    resize: false,
                    offset: 'c',
                    content: _this.GetSingleTemplate(),
                    zIndex: layer.zIndex, //重点1 
                    success: function(layero) {
                        layer.setTop(layero); //重点2
                        let _chatSettings = chatSetting.get();
                        $(layero[0]).find('.layui-layer-content').css('background-color', `rgba(255, 255, 255, ${_chatSettings.panelOpacity})`);
                        //滚动到底部
                        $(layero[0]).find('.chat-window-main').css('width', '700px');
                        $(layero[0]).find('.chat-window-content').animate({ scrollTop: $(layero[0]).find('.chat-window-content').prop("scrollHeight") + 50 }, 600);

                        $(layero[0]).css('background-image', `url(${chatSetting.get().skin})`);
                        //TODO:绑定各种按钮 
                        $(layero[0]).find('.chat-window-history-btns').attr('data-chatid', groupid);
                        $(layero[0]).find('.chat-window-close-btn').attr('data-chatid', groupid);

                        $(layero[0]).find('.chat-window-close-btn').off('click').on('click', function() {
                            layer.close($(this).parent().parent().parent().parent().parent().parent().parent().attr('times'));
                        });
                        $(layero[0]).find('.chat-window-history-btns').off('click').on('click', function() {

                            let _$this = $(this);
                            if (_$this.attr('times') !== undefined) {
                                layer.close(_$this.attr('times'))
                            } else {
                                layer.open({
                                    type: 1,
                                    id: 'ChatHistory' + groupid,
                                    skin: 'chat-history ' + groupid,
                                    title: `群(${groupid}) 的聊天记录`,
                                    area: ['450px', '100%'],
                                    shade: 0,
                                    maxmin: false,
                                    resize: false,
                                    offset: 'rb',
                                    anim: 2,
                                    content: ` 
                                    <div class="chat-window-history-container">
                                        <div class="chat-window-history-search">
                                            <input type="text" name="HistorySearchKey" placeholder="关键字..." autocomplete="off" class="layui-input">
                                            <button type="button" class="layui-btn history-search-btn">搜索</button>
                                        </div> 
                                        <div class="chat-window-history-scroll"> 
                                            <ul class="chat-window-history-content single"> 
                                                <li class="main-user-msg">
                                                    <img src="images/avatar/avatar_002.png" alt="">
                                                    <div class="main-user-msg-title"> 
                                                        <span class="nickname">小鱼呆猫儿</span>
                                                        <span class="send-msg-time">2020-02-01 20:07:59</span>
                                                    </div>
                                                    <div class="main-user-msg-content">#qq_47#你好，我是小呆猫儿哟</div>
                                                </li>
                                                <li class="main-user-msg self">
                                                    <img src="images/avatar/avatar_001.png" alt="">
                                                    <div class="main-user-msg-title"> 
                                                        <span class="send-msg-time">2020-02-01 20:09:59</span>
                                                        <span class="nickname">提拉米苏的呆猫 </span>
                                                    </div>
                                                    <div class="main-user-msg-content">
                                                        <span  class="text-msg">你好呀，小呆猫儿...</span>
                                                        <img class="emoji" title="图片表情包" layer-src="../images/avatar/avatar_004.png" src="../images/avatar/avatar_004.png" alt="">
                                                    </div>
                                                </li>
                                                <li class="main-user-msg self">
                                                    <img src="images/avatar/avatar_001.png" alt="">
                                                    <div class="main-user-msg-title"> 
                                                        <span class="send-msg-time">2020-02-01 20:09:59</span>
                                                        <span class="nickname">提拉米苏的呆猫 </span>
                                                    </div>
                                                    <div class="main-user-msg-content">
                                                        <span  class="text-msg">你好呀，小呆猫儿...</span>
                                                        <img class="image" title="图片名称" layer-src="../images/avatar/avatar_007.png" src="../images/avatar/avatar_007.png" alt="">
                                                    </div>
                                                </li>
                                                <li class="main-user-msg self">
                                                    <img src="images/avatar/avatar_001.png" alt="">
                                                    <div class="main-user-msg-title"> 
                                                        <span class="send-msg-time">2020-02-01 20:09:59</span>
                                                        <span class="nickname">提拉米苏的呆猫 </span>
                                                    </div>
                                                    <div class="main-user-msg-content">
                                                        <a href="javascript:" data-href="http://cloud.925i.cn" title="http://cloud.925i.cn">http://cloud.925i.cn</a>
                                                    </div>
                                                </li> 
                                            </ul> 
                                        </div>
                                    </div> 
                                    `,
                                    zIndex: layer.zIndex, //重点1 
                                    success: function(layero2) {
                                        flow.load({
                                            elem: $(layero2[0]).find('.chat-window-history-content'), //流加载容器
                                            scrollElem: $(layero2[0]).find('.chat-window-history-scroll'), //滚动条所在元素，一般不用填，此处只是演示需要。
                                            isAuto: false,
                                            done: function(page, next) { //加载下一页
                                                //模拟插入
                                                let _template = `
                                                    <li class="main-user-msg">
                                                        <img src="images/avatar/avatar_002.png" alt="">
                                                        <div class="main-user-msg-title"> 
                                                            <span class="nickname">小鱼呆猫儿</span>
                                                            <span class="send-msg-time">2020-02-01 20:07:59</span>
                                                        </div>
                                                        <div class="main-user-msg-content">#qq_47#你好，我是小呆猫儿哟</div>
                                                    </li>
                                                    <li class="main-user-msg self">
                                                        <img src="images/avatar/avatar_001.png" alt="">
                                                        <div class="main-user-msg-title"> 
                                                            <span class="send-msg-time">2020-02-01 20:09:59</span>
                                                            <span class="nickname">提拉米苏的呆猫 </span>
                                                        </div>
                                                        <div class="main-user-msg-content">
                                                            <span class="text-msg">你好呀，小呆猫儿...</span>
                                                            <img class="emoji" title="图片表情包" layer-src="../images/avatar/avatar_004.png" src="../images/avatar/avatar_004.png" alt="">
                                                        </div>
                                                    </li>
                                                `;
                                                setTimeout(() => {
                                                    var lis = [];
                                                    for (var i = 0; i < 6; i++) {
                                                        lis.push(_template);
                                                    }
                                                    next(lis.join(''), page < 6); //假设总页数为 6
                                                    _bindEvents.parseEmoji($(layero2[0]).find('.main-user-msg-content'));
                                                    _bindEvents.bindPreviewImages(layero2[0]);
                                                }, 500);
                                            }
                                        });

                                        _$this.attr('times', $(layero2[0]).attr('times'));
                                    },
                                    end: function() {
                                        _$this.removeAttr('times');
                                    }
                                })
                            }
                        });

                        let locktime = 500;
                        $(layero[0]).find('.chat-window-send-btn').off('click').on('click', function() {
                            let _$msgText = $(this).parent().parent().find('textarea[name=SendMessageText]'),
                                _$msgLiscontainer = $(this).parent().parent().parent().parent().parent().find('.chat-window-content');
                            if (!_this.lock) {
                                _this.lock = true;

                                if (_$msgText.val().trim() !== '') {

                                    _$msgLiscontainer.append(_this.SendSingleMsg({
                                        user: {
                                            nickname: '提拉米苏的呆猫',
                                            avatar: 'images/avatar/avatar_001.png'
                                        },
                                        content: _$msgText.val(),
                                        time: new Date()
                                    }));
                                    _$msgText.val('');
                                    _$msgText.text('');
                                    _bindEvents.parseEmoji($(layero[0]).find('.main-user-msg-content'));
                                    _$msgLiscontainer.animate({ scrollTop: _$msgLiscontainer.prop("scrollHeight") }, 10);

                                }
                                clearTimeout(_this.lock);
                                _this.lock = setTimeout(() => {
                                    _this.lock = false;
                                }, locktime)
                            }
                            // let _$msgText = $(this).parent().parent().find('.send-message-text-input'),
                            //     _$msgLiscontainer = $(this).parent().parent().parent().parent().parent().find('.chat-window-content');
                            // if (_$msgText.val().trim() !== '') {
                            //     _$msgLiscontainer.find('.mCSB_container').append(_this.SendSingleMsg({
                            //         // content: _$msgText.html(),
                            //         content: _$msgText.val().trim(),
                            //         time: new Date()
                            //     }));
                            //     _bindEvents.parseEmoji('.main-user-msg-content');
                            //     _$msgText.val('');

                            //     _$msgLiscontainer.find('.mCSB_container').css({ 'top': -(_$msgLiscontainer.find('.mCSB_container').prop("scrollHeight") - 400) });
                            // }
                        });
                        $(layero[0]).find('textarea[name=SendMessageText]').keypress(function(e) {　
                            if (!_this.lock) {
                                _this.lock = true;
                                if (e.keyCode == 13) {　　
                                    e.preventDefault();　　
                                    let _$msgText = $(this).val(),
                                        _$msgLiscontainer = $(this).parent().parent().parent().parent().find('.chat-window-content');
                                    if (_$msgText.trim() !== '') {
                                        _$msgLiscontainer.append(_this.SendSingleMsg({
                                            user: {
                                                nickname: '提拉米苏的呆猫',
                                                avatar: 'images/avatar/avatar_001.png'
                                            },
                                            content: _$msgText,
                                            time: new Date()
                                        }));
                                        $(this).val('');
                                        $(this).text('');
                                        _bindEvents.parseEmoji($(layero[0]).find('.main-user-msg-content'));
                                        _$msgLiscontainer.animate({ scrollTop: _$msgLiscontainer.prop("scrollHeight") }, 10);
                                    }
                                }
                                clearTimeout(_this.lock);
                                _this.lock = setTimeout(() => {
                                    _this.lock = false;
                                }, locktime);
                            }
                        });
                        _bindEvents.renderEmoji({
                            container: $(layero[0]).find(".send-message-text-input"),
                            button: $(layero[0]).find('.chat-window-emoji-btn')
                        });

                        //TODO:绑定邀请好友加入群聊
                        $(layero[0]).find('.add-group-member').off('click').on('click', function() {
                            _chatPanelGroup.inviteJoinGroup($(this).data('groupid'));
                        });

                        // 渲染群里用户列表
                        $(layero[0]).find('.chat-window-group-users').addClass('active');
                        //同时获取数据
                        // res.users.forEach((item,index)=>{
                        //     let _userTemplate=`
                        //         <li class="chat-window-group-users-item" title="提拉米苏${index}号猫"> 
                        //             <span class="group-users-item-identity creator">群主</span> 
                        //             <img class="group-users-item-avatar" src="images/avatar/avatar_001.png" alt="头像">
                        //             <h5 class="group-users-item-nickname">提拉米苏${index}号猫</h5>
                        //             <!-- <img class="group-users-item-identity creator" src="images/avatar/avatar_001.png" alt="头像"/> -->
                        //             <!-- <span class="group-users-item-identity creator">群主</span>  -->
                        //         </li> 
                        //     `;
                        //  $(layero[0]).find('.chat-window-group-users-count>span').text(`${res2.onlineCount}/${res2.count}`)
                        //     $(layero[0]).find('.chat-window-group-users-list').append(_userTemplate);
                        // })

                        _this.GetGroupMembers(layero);
                        $(layero[0]).find('.group-users-search-clear-btn').off('click').on('click', function() {
                            let _searchKey = $(this).parent().find('input[name=GroupUsersSearchInput]');
                            if (_searchKey.val().trim() !== '') {
                                _searchKey.val('');
                                _this.GetGroupMembers(layero);
                            }
                        });
                        $(layero[0]).find('input[name=GroupUsersSearchInput]').off('input').on('input', function(e) {
                            console.log('搜索好友：' + $(this).val());
                            let _searchKey = $(this).val();
                            if (_searchKey.trim() === '') {
                                _this.GetGroupMembers(layero);
                                return;
                            }
                            $.ajax({
                                url: 'https://www.fastmock.site/mock/992387632827a42b26d0a126c2acdea5/ChatPages/api/SearchGroupMember',
                                type: 'POST',
                                data: { key: _searchKey },
                                dataType: 'json',
                                success: function(res3) {
                                    let _userTemplates = '';
                                    if (res3.count <= 0) {
                                        _userTemplates = `
                                             
                                       `;
                                    } else {
                                        res3.data.forEach((item, index) => {
                                            _userTemplates += `
                                                <li class="chat-window-group-users-item" data-userid="${item.id}" title="${item.nickname}"> 
                                                    <span class="group-users-item-identity ${item.isCreator?'creator':''}">${item.isCreator?'群主':'成员'}</span> 
                                                    <img class="group-users-item-avatar" src="${item.avatar}" alt="头像">
                                                    <h5 class="group-users-item-nickname">${item.nickname}</h5> 
                                                </li> 
                                            `;
                                        });
                                    }

                                    $(layero[0]).find('.chat-window-group-users-list').html(_userTemplates);
                                    $(layero[0]).find('.chat-window-group-users-item').off('click').on('click', function() {
                                        $(this).addClass('active').siblings().removeClass('active');
                                    });
                                    $(layero[0]).find('.chat-window-group-users-item').off('dblclick').on('dblclick', function() {
                                        let _userId = $(this).data('userid');
                                        if (_loginUser.get().id === _userId) return;
                                        _chatWindowEvents.ShowSingleWindowPanel(_userId, {
                                            userid: _userId,
                                            nickname: $(this).attr('title'),
                                            time: new Date()
                                        });
                                    })

                                },
                                fail: function() {
                                    console.log('群成员列表搜索失败。')
                                }
                            })
                        })

                        _bindEvents.bindChatWindowTools(layero);

                        // 模拟接收信息
                        let _IntervalCount = 0;
                        let _interval = setInterval(function() {
                            if (_IntervalCount >= 2) {
                                clearInterval(_interval);
                            }
                            _IntervalCount++;
                            let _$msgLiscontainer = $(layero[0]).find(".chat-window-content");
                            if (_IntervalCount < 2) {
                                _$msgLiscontainer.append(`
                                    <li class="main-user-msg join"> 
                                        <span>智障少女 加入了群聊！</span>
                                    </li>
                                `);
                            } else if (_IntervalCount < 3) {
                                _$msgLiscontainer.append(`
                                    <li class="main-user-msg join invite-join"> 
                                        <span>提拉米苏的呆猫 邀请 小鱼呆猫儿 加入了群聊！</span>
                                    </li>
                                `);
                            } else {
                                _$msgLiscontainer.append(_this.ReceiveSingleMsg({
                                    user: {
                                        nickname: '智障少女',
                                        avatar: `images/avatar/avatar_005.png`
                                    },
                                    content: '#qq_19#这里是群聊吗，请问有人在吗？',
                                    time: new Date()
                                }))
                            }
                            _bindEvents.parseEmoji($(layero[0]).find('.main-user-msg-content'));
                            _bindEvents.bindPreviewImages(layero);
                            _$msgLiscontainer.animate({ scrollTop: _$msgLiscontainer.prop("scrollHeight") }, 10);

                        }, Math.floor(Math.random() * 10) * 1000);

                        _bindEvents.bindPreviewImages(layero);
                    }
                });

                //     },
                //     fail: function() {
                //         console.log('请求错误！')
                //     }
                // })
            },
            GetGroupMembers: function(layero) {
                //独立获取数据（群成员列表）
                $.ajax({
                    url: 'https://www.fastmock.site/mock/992387632827a42b26d0a126c2acdea5/ChatPages/api/GetMembersByGroupId',
                    type: 'POST',
                    dataType: 'json',
                    success: function(res2) {
                        let _userTemplates = '';
                        res2.data.forEach((item, index) => {
                            _userTemplates += `
                                <li class="chat-window-group-users-item" data-userid="${item.id}" title="${item.nickname}"> 
                                    <span class="group-users-item-identity ${item.isCreator?'creator':''}">${item.isCreator?'群主':'成员'}</span> 
                                    <img class="group-users-item-avatar" src="${item.avatar}" alt="头像">
                                    <h5 class="group-users-item-nickname">${item.nickname}</h5> 
                                </li> 
                            `;
                        })
                        $(layero[0]).find('.chat-window-group-users-count>.add-group-member').attr('data-groupid', res2.id);
                        $(layero[0]).find('.chat-window-group-users-count>.group-member-count').text(`${res2.onlineCount}/${res2.count}`)
                        $(layero[0]).find('.chat-window-group-users-list').html(_userTemplates);
                        $(layero[0]).find('.chat-window-group-users-item').off('click').on('click', function() {
                            $(this).addClass('active').siblings().removeClass('active');
                        })
                        $(layero[0]).find('.chat-window-group-users-item').off('dblclick').on('dblclick', function() {
                            let _userId = $(this).data('userid');
                            if (_loginUser.get().id === _userId) return;
                            _chatWindowEvents.ShowSingleWindowPanel(_userId, {
                                userid: _userId,
                                nickname: $(this).attr('title'),
                                time: new Date()
                            });
                        })
                    },
                    fail: function() {
                        console.log('获取群成员失败！')
                    }
                })
            }
        }

        /** 弹窗数据 */
        const _chatAlertData = {
            lock: false,
            timer: null,
            /** 弹出皮肤选择 */
            RenderSkins: function() {
                let _this = this;
                let _selectedSkin = chatSetting.get();
                $.ajax({
                    url: 'https://www.fastmock.site/mock/992387632827a42b26d0a126c2acdea5/ChatPages/api/GetSkins',
                    type: 'POST',
                    dataType: 'json',
                    success: function(res) {
                        let _activeSkinId = chatSetting.get().skin.id;
                        let _skinTemplate = `
                            <ul class="chat-panel-set-skins">
                                <li class="select-skin select-skin-default ${_activeSkinId===0?'active':''}" data-url="" data-skinid="0">
                                    <a href="javascript:">默认</a>
                                </li> 
                            `;
                        res.data.forEach((item, index) => {
                            _skinTemplate += `
                                <li class="select-skin ${_activeSkinId===item.id?'active':''}" data-url="${item.src}" title="${item.name}" data-skinid="${item.id}">
                                    <i class="layui-icon layui-icon-close del-custom-skin-btn ${item.isCustom?'show':''}" data-skinid="${item.id}"></i>
                                    <a href="javascript:">
                                        <img src="${item.src}" alt="">
                                    </a>
                                </li>
                            `;
                        })

                        _skinTemplate += `
                            <li class="upload-skin" id="UploadSkin" title="上传皮肤">
                                <a href="javascript:">
                                    <i class="layui-icon layui-icon-add-1"></i>
                                </a>
                            </li>
                        </ul> `;

                        layer.open({
                            id: 'ChatSelectSkins',
                            skin: 'selectskins-dialog',
                            type: 1,
                            anim: 2,
                            shade: 0,
                            title: '设置皮肤',
                            area: ['420px'],
                            content: _skinTemplate,
                            success: function() {
                                _bindEvents.bindSelectSkin();
                                _bindEvents.bindDeleteCustomSkin();
                            },
                            end: function() {

                            }
                        });


                    },
                    fail: function() {
                        console.log('获取皮肤错误！')
                    }
                })
            }
        };

        /** 底部功能模块模板 */
        const _footFuncTemplate = {
            lock: false,
            timer: null,
            /** 获取消息盒子模板 */
            GetChatMsgBoxTemplate: function() {
                return `
                    <div class="chat-msgbox-container">
                        <div class="chat-msgbox-content">
                            <ul class="chat-msgbox-list">

                            </ul>
                        </div>
                    </div>
                `;
            },
            /** 消息盒子列表 */
            GetChatMsgBoxItemTemplate: function(tempData) {
                let _template = '';
                if (tempData.isApply) {

                    _template = ` 
                    <li class="chat-msgbox-item">
                        <div class="layui-row">
                            <div class="layui-col-xs1">
                                <img class="msgbox-item-avatar" data-id="${tempData.userid}" src="images/avatar/avatar_00${tempData.index+1}.png" alt="">
                            </div>
                            <div class="layui-col-xs8">
                                <h5 class="msgbox-item-name"><span class="msgbox-item-nickname" data-id="2">一只小程序员${tempData.index}号</span><span class="time-ago">刚刚</span></h5>
                                <p class="msgbox-item-description"><span>申请添加你为好友</span><span class="msgbox-item-message">附加消息：一只小程序员，码上！！！</span></p>
                            </div>
                            <div class="layui-col-xs3">
                                <button class="layui-btn msgbox-item-btn msgbox-agree-btn" data-id="${tempData.userid}" data-type="group">同意</button>
                                <button class="layui-btn msgbox-item-btn layui-btn-primary msgbox-refuse-btn" data-id="${tempData.userid}" data-type="group">拒绝</button>
                            </div>
                        </div>
                    </li>
                `;
                } else {
                    _template = ` 
                    <li class="chat-msgbox-item">
                        <div class="msgbox-item-sys">
                            <span class="msgbox-item-sys-tip">系统：</span>
                            <span class="msgbox-item-sys-nickname" data-id="${tempData.userid}" title="小莫学长${tempData.index}号">小莫学长${tempData.index}号(<span class="msgbox-item-sys-id">${tempData.userid}</span>)</span>
                            <span class="msgbox-item-sys-message">已经同意了您的好友申请</span>
                            <span class="msgbox-item-sys-time-ago">10天前</span>
                        </div>
                    </li>
                  `;
                }
                return _template;
            }
        }

        /** 定义设置窗口面板 */
        const _settingPanel = {
            lock: false,
            timer: null,
            template: function() {
                return `
                    <div class="chat-settings">
                        <form class="layui-form " action="" id="PanelSettingForm" lay-filter="PanelSettingForm">
                            <div class="layui-form-item">
                                <label class="layui-form-label">好友列表模式</label>
                                <div class="layui-input-block">
                                    <input type="checkbox" checked="" name="SwitchAccordion" lay-skin="switch" lay-filter="switchAccordion" lay-text="开启手风琴|关闭手风琴">
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <label class="layui-form-label">面板透明度</label>
                                <div class="layui-input-inline slider" >
                                    <div id="PanelOpacitySilder" class="panel-opacity-silder"></div>
                                </div> 
                            </div> 
                            <div class="layui-form-item">
                                <label class="layui-form-label">窗口背景颜色</label>
                                <div class="layui-input-inline" >
                                    <input type="text" readonly name="SetWindowBGColor" placeholder="请选择颜色" class="layui-input">
                                </div>
                                <div class="layui-inline" style="left: -11px;">
                                    <div id="SetWindowBGColor"></div>
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <label class="layui-form-label">窗口文字颜色</label>
                                <div class="layui-input-inline" >
                                    <input type="text"readonly name="SetWindowFontColor"  placeholder="请选择颜色" class="layui-input">
                                </div>
                                <div class="layui-inline" style="left: -11px;">
                                    <div id="SetWindowFontColor"></div>
                                </div>
                            </div>  
                        </form>
                    </div> 
                `;
            },
            show: function() {
                let _this = this;
                layer.open({
                    type: 1,
                    id: 'ChatSetting',
                    anim: 2,
                    area: ['440px', ''],
                    shade: 0,
                    title: '设置',
                    content: _this.template(),
                    success: function(layero) {
                        console.log(chatSetting.get());
                        let _chatSettings = chatSetting.get();

                        //给表单赋值
                        form.val("PanelSettingForm", {
                            "SwitchAccordion": _chatSettings.listAccordion
                        });

                        let _slider = slider.render({
                            elem: '#PanelOpacitySilder',
                            min: 0,
                            max: 10,
                            step: 1,
                            theme: _chatSettings.bgColor || 'rgb(0, 150, 136)',
                            setTips: function(value) { //自定义提示文本
                                return value / 10; //设置值后 change的value会受影响
                            },
                            change: function(value) {
                                console.log(value); //动态获取滑块数值
                                chatSetting.set({
                                    panelOpacity: value
                                });
                                //do something
                                $('.panel-body-tab').css('background-color', `rgba(255, 255, 255, ${value})`)
                            }
                        });
                        _slider.setValue(_chatSettings.panelOpacity * 10 || 0);

                        //表单赋值
                        $('input[name=SetWindowBGColor]').val(_chatSettings.bgColor);
                        colorpicker.render({
                            elem: '#SetWindowBGColor',
                            color: _chatSettings.bgColor,
                            format: 'rgb',
                            predefine: true,
                            alpha: true,
                            done: function(color) {
                                $('input[name=SetWindowBGColor]').val(color);
                                layer.tips('给指定隐藏域设置了颜色值：' + color, this.elem);
                                chatSetting.set({
                                    bgColor: color
                                })
                                color || this.change(color); //清空时执行 change
                            },
                            change: function(color) {
                                //触发设置 实时预览
                                console.log('aaaaa')
                            }
                        })

                        $('input[name=SetWindowFontColor]').val(_chatSettings.fontColor);
                        colorpicker.render({
                            elem: '#SetWindowFontColor',
                            color: _chatSettings.fontColor,
                            format: 'rgb',
                            predefine: true,
                            alpha: true,
                            done: function(color) {
                                $('input[name=SetWindowFontColor]').val(color);
                                layer.tips('给指定隐藏域设置了颜色值：' + color, this.elem);
                                chatSetting.set({
                                    fontColor: color
                                })

                                color || this.change(color); //清空时执行 change
                            },
                            change: function(color) {
                                //触发设置 实时预览
                            }
                        })
                        form.render();

                        let _$switchAccordion = $('#PanelSettingForm').find('.layui-form-switch');
                        if (_chatSettings.listAccordion) {
                            _$switchAccordion.css({
                                'border-color': _chatSettings.bgColor,
                                'background-color': _chatSettings.bgColor
                            });
                        }

                        //监听指定开关
                        form.on('switch(switchAccordion)', function(data) {
                            chatSetting.set({
                                listAccordion: this.checked
                            })
                            console.log(this.checked)
                            if (this.checked) {
                                _$switchAccordion.css({
                                    'border-color': _chatSettings.bgColor,
                                    'background-color': _chatSettings.bgColor
                                });
                            } else {
                                _$switchAccordion.css({
                                    'border-color': '#d2d2d2',
                                    'background-color': '#fff'
                                });
                            }
                            console.log(_$switchAccordion)
                            layer.msg('保存成功！');
                        });

                    },
                    end: function() {}
                });

            }
        }

        /** 绑定的事件 */
        const _bindEvents = {
            lock: false,
            timer: null,
            renderScroll: function() {
                $('.chat-window-content').mCustomScrollbar({
                    scrollButtons: {
                        enable: true
                    },
                    theme: 'dark-3'
                });
            },
            parseEmoji: function(ele) {
                $(ele).emojiParse({
                    icons: [{
                        path: "/libs/emoji/dist/img/tieba/",
                        file: ".jpg",
                        placeholder: ":{alias}:",
                        alias: {
                            1: "hehe",
                            2: "haha",
                            3: "tushe",
                            4: "a",
                            5: "ku",
                            6: "lu",
                            7: "kaixin",
                            8: "han",
                            9: "lei",
                            10: "heixian",
                            11: "bishi",
                            12: "bugaoxing",
                            13: "zhenbang",
                            14: "qian",
                            15: "yiwen",
                            16: "yinxian",
                            17: "tu",
                            18: "yi",
                            19: "weiqu",
                            20: "huaxin",
                            21: "hu",
                            22: "xiaonian",
                            23: "neng",
                            24: "taikaixin",
                            25: "huaji",
                            26: "mianqiang",
                            27: "kuanghan",
                            28: "guai",
                            29: "shuijiao",
                            30: "jinku",
                            31: "shengqi",
                            32: "jinya",
                            33: "pen",
                            34: "aixin",
                            35: "xinsui",
                            36: "meigui",
                            37: "liwu",
                            38: "caihong",
                            39: "xxyl",
                            40: "taiyang",
                            41: "qianbi",
                            42: "dnegpao",
                            43: "chabei",
                            44: "dangao",
                            45: "yinyue",
                            46: "haha2",
                            47: "shenli",
                            48: "damuzhi",
                            49: "ruo",
                            50: "OK"
                        }
                    }, {
                        path: "/libs/emoji/dist/img/qq/",
                        file: ".gif",
                        placeholder: "#qq_{alias}#"
                    }]
                });
            },
            renderEmoji: function(options) {
                $(options.container).emoji({
                    button: options.button,
                    // button: '#EmojiBtn',
                    showTab: true,
                    animation: 'fade',
                    icons: [{
                        name: "普通表情",
                        path: "/libs/emoji/dist/img/tieba/",
                        maxNum: 50,
                        file: ".jpg",
                        placeholder: ":{alias}:",
                        alias: {
                            1: "hehe",
                            2: "haha",
                            3: "tushe",
                            4: "a",
                            5: "ku",
                            6: "lu",
                            7: "kaixin",
                            8: "han",
                            9: "lei",
                            10: "heixian",
                            11: "bishi",
                            12: "bugaoxing",
                            13: "zhenbang",
                            14: "qian",
                            15: "yiwen",
                            16: "yinxian",
                            17: "tu",
                            18: "yi",
                            19: "weiqu",
                            20: "huaxin",
                            21: "hu",
                            22: "xiaonian",
                            23: "neng",
                            24: "taikaixin",
                            25: "huaji",
                            26: "mianqiang",
                            27: "kuanghan",
                            28: "guai",
                            29: "shuijiao",
                            30: "jinku",
                            31: "shengqi",
                            32: "jinya",
                            33: "pen",
                            34: "aixin",
                            35: "xinsui",
                            36: "meigui",
                            37: "liwu",
                            38: "caihong",
                            39: "xxyl",
                            40: "taiyang",
                            41: "qianbi",
                            42: "dnegpao",
                            43: "chabei",
                            44: "dangao",
                            45: "yinyue",
                            46: "haha2",
                            47: "shenli",
                            48: "damuzhi",
                            49: "ruo",
                            50: "OK"
                        },
                        title: {
                            1: "呵呵",
                            2: "哈哈",
                            3: "吐舌",
                            4: "啊",
                            5: "酷",
                            6: "怒",
                            7: "开心",
                            8: "汗",
                            9: "泪",
                            10: "黑线",
                            11: "鄙视",
                            12: "不高兴",
                            13: "真棒",
                            14: "钱",
                            15: "疑问",
                            16: "阴脸",
                            17: "吐",
                            18: "咦",
                            19: "委屈",
                            20: "花心",
                            21: "呼~",
                            22: "笑脸",
                            23: "冷",
                            24: "太开心",
                            25: "滑稽",
                            26: "勉强",
                            27: "狂汗",
                            28: "乖",
                            29: "睡觉",
                            30: "惊哭",
                            31: "生气",
                            32: "惊讶",
                            33: "喷",
                            34: "爱心",
                            35: "心碎",
                            36: "玫瑰",
                            37: "礼物",
                            38: "彩虹",
                            39: "星星月亮",
                            40: "太阳",
                            41: "钱币",
                            42: "灯泡",
                            43: "茶杯",
                            44: "蛋糕",
                            45: "音乐",
                            46: "haha",
                            47: "胜利",
                            48: "大拇指",
                            49: "弱",
                            50: "OK"
                        }
                    }, {
                        path: "/libs/emoji/dist/img/qq/",
                        maxNum: 91,
                        name: '动态表情',
                        excludeNums: [41, 45, 54],
                        file: ".gif",
                        placeholder: "#qq_{alias}#"
                    }]
                });
            },
            /** 绑定好友列表双击 */
            bindShowMessage: function() {
                let _this = this;

                $('.chat-panel-user-item').off('dblclick').on('dblclick', function() {
                    let _userNickname = $(this).data('nickname'),
                        _width = '700px',
                        _userId = $(this).data('userid');
                    console.log('用户Id：' + _userId);

                    _chatWindowEvents.ShowSingleWindowPanel(_userId, {
                        userid: _userId,
                        nickname: _userNickname,
                        width: _width
                    });
                });
            },
            /**  绑定好友列表分组点击 */
            bindFriendsGroup: function() {
                $('.layui-colla-title').off('click').on('click', function() {
                    var _isAccordion = $('#UserFriendsList').attr('lay-accordion');
                    if (_isAccordion !== undefined) {
                        $(this).parent().siblings().find('.layui-icon').removeClass('layui-icon-down').addClass('layui-icon-right');
                        $(this).parent().siblings().find('.layui-colla-content').removeClass('layui-show');
                    }
                    if ($(this).find('.layui-icon').hasClass('layui-icon-down')) {
                        $(this).find('.layui-icon').removeClass('layui-icon-down').addClass('layui-icon-right');
                        $(this).parent().find('.layui-colla-content').removeClass('layui-show');
                    } else {
                        $(this).find('.layui-icon').removeClass('layui-icon-right').addClass('layui-icon-down');
                        $(this).parent().find('.layui-colla-content').removeClass('layui-show').addClass('layui-show');
                    }
                });
            },
            /** 绑定选择皮肤操作 */
            bindSelectSkin: function() {
                let _this = this,
                    _select = 'default';
                $('.select-skin').off('click').on('click', function() {
                    let _skinId = $(this).data('skinid'),
                        _skinUrl = $(this).data('url');
                    if (_select !== _skinUrl) {
                        _select = _skinUrl;
                        $(this).addClass('active').siblings().removeClass('active');
                        chatSetting.set({
                            skin: {
                                id: _skinId,
                                src: _skinUrl
                            }
                        });
                    }

                });
                console.log('自定义皮肤上传');
                //普通图片上传
                let _uploadInst = upload.render({
                    elem: '.upload-skin',
                    url: 'https://httpbin.org/post', //改成您自己的上传接口  
                    size: 1024, //限制文件大小，单位 KB
                    before: function(obj) {
                        //预读本地文件示例，不支持ie8
                        // obj.preview(function(index, file, result) {
                        //     $('#demo1').attr('src', result); //图片链接（base64）
                        // });
                        console.log('皮肤正在上传...')
                    },
                    done: function(res) {
                        console.log(res)
                            //如果上传失败
                        if (res.code > 0) {
                            return layer.msg('上传失败');
                        }
                        //上传成功
                        chatSetting.set({
                            skin: {
                                id: Math.random() * Math.random() * 10,
                                src: res.files.file
                            }
                        });
                        // let _skinTemplate = `
                        //     <li class="select-skin" data-url="${res.data.src}" title="${res.name}" data-skinid="${item.id}">
                        //         <i class="layui-icon layui-icon-close del-custom-skin-btn ${item.isCustom?'show':''}" data-skinid="${item.id}"></i>
                        //         <a href="javascript:">
                        //             <img src="${res.data.src}" alt="">
                        //         </a>
                        //     </li>
                        // `;
                        let _skinTemplate = `
                            <li class="select-skin active" data-url="${res.files.file}" title="自定义皮肤" data-skinid="666">
                                <i class="layui-icon layui-icon-close del-custom-skin-btn show" data-skinid="666" title="删除"></i>
                                <a href="javascript:">
                                    <img src="${res.files.file}" alt="">
                                </a>
                            </li>
                        `;
                        $('.selectskins-dialog').find('.select-skin').removeClass('active');
                        $('.selectskins-dialog').find('.upload-skin').before(_skinTemplate);
                        _this.bindSelectSkin();
                        _this.bindDeleteCustomSkin();
                        // //上传成功
                        // chatSetting.set({
                        //     skin: res.data.src
                        // });
                        // chatSetting.set({
                        //     skin:  {
                        //         id: Math.random() * Math.random() * 10,
                        //         src:res.data.src
                        //     } 
                        // });
                        console.log('皮肤上传完成')
                    },
                    error: function() {
                        console.log('上传失败');
                        // //演示失败状态，并实现重传
                        // var demoText = $('#demoText');
                        // demoText.html('<span style="color: #FF5722;">上传失败</span> <a class="layui-btn layui-btn-xs demo-reload">重试</a>');
                        // demoText.find('.demo-reload').on('click', function() {
                        //     _uploadInst.upload();
                        // });
                    }
                });
            },
            /** 删除自定义上传的皮肤 */
            bindDeleteCustomSkin: function() {
                $('.del-custom-skin-btn').off('click').on('click', function() {
                    let _$this = $(this);
                    // $.ajax({
                    //     url:'',
                    //     type:'POST',
                    //     data:$(_this).data('skinid'),
                    //     dataType:'json',
                    //     success:function(res){
                    //         console.log(res)
                    //         _this.parent().remove();
                    //     },
                    //     fail:function(){
                    //         console.log('删除皮肤失败')
                    //     }
                    // })
                    layer.confirm('你确定要删除该皮肤吗？', {
                        title: '删除提示',
                        btn: ['确定', '点错了'],
                        btnAlign: 'c'
                    }, function() {
                        _$this.parent().remove();
                        if (chatSetting.get().skin.src === _$this.parent().data('url')) {
                            chatSetting.set({
                                skin: {
                                    id: 0,
                                    src: ''
                                }
                            });
                        }
                    });

                });
            },
            /** 好友面板底部功能 */
            bindFootFuns: function() {
                let _this = this;
                $('.panel-foot-func-btn').off('click').on('click', function() {
                    let _funcId = $(this).data('funcid');
                    switch (_funcId) {
                        case "menu":
                            {
                                console.log('打开功能菜单');
                            }
                            break;
                        case "setting":
                            {
                                _settingPanel.show();
                            }
                            break;
                        case "addfriend":
                            {
                                _chatPanelAddSearch.show();
                            }
                            break;
                        case "msgbox":
                            {
                                layer.open({
                                    id: 'ChatMsgBox',
                                    type: 1,
                                    title: '消息盒子',
                                    area: ['600px', '480px'],
                                    shade: 0,
                                    maxmin: false,
                                    resize: false,
                                    content: _footFuncTemplate.GetChatMsgBoxTemplate(),
                                    success: function(layero) {
                                        let _count = 0;
                                        flow.load({
                                            elem: $(layero).find('.chat-msgbox-list'), //流加载容器 
                                            scrollElem: $(layero).find('.chat-msgbox-container'), //滚动条所在元素，一般不用填，此处只是演示需要。
                                            isAuto: false,
                                            done: function(page, next) { //加载下一页
                                                //模拟插入
                                                console.log('流加载数据列表...')
                                                setTimeout(() => {
                                                    var lis = [];
                                                    for (var i = 0; i < 3; i++) {
                                                        _count++;
                                                        lis.push(_footFuncTemplate.GetChatMsgBoxItemTemplate({
                                                            index: _count,
                                                            userid: _count,
                                                            isApply: _count < 8 ? true : false
                                                        }))
                                                    }
                                                    next(lis.join(''), page < 3); //假设总页数为 6
                                                    console.log('流加载数据中...')

                                                    $(layero).find('.msgbox-agree-btn').off('click').on('click', function() {
                                                        if (!_this.lock) {
                                                            _this.lock = true;

                                                            console.log($(this).data('id'));
                                                            console.log($(this).data('type'));
                                                            clearTimeout(_this.timer)
                                                            _this.timer = setTimeout(() => {
                                                                _this.lock = false;
                                                            }, 500);
                                                        }
                                                    });
                                                    $(layero).find('.msgbox-refuse-btn').off('click').on('click', function() {
                                                        if (!_this.lock) {
                                                            _this.lock = true;

                                                            console.log($(this).data('id'));
                                                            console.log($(this).data('type'));
                                                            clearTimeout(_this.timer)
                                                            _this.timer = setTimeout(() => {
                                                                _this.lock = false;
                                                            }, 500);
                                                        }
                                                    });
                                                }, 500);
                                            }
                                        });
                                    },
                                    end: function() { //此处用于演示

                                    }
                                });
                            }
                            break;
                        case "skins":
                            {
                                console.log('打开更换皮肤设置');
                                _chatAlertData.RenderSkins();
                            }
                            break;
                    }

                });
            },
            /** 面板搜索结果列表双击事件 */
            bindSearchResultItem: function() {
                $('.chat-panel-search-item').off('dblclick').on('dblclick', function() {
                    let _objectId = $(this).data('objectid'),
                        _type = $(this).data('type');
                    if (_type === 'group') {
                        _chatWindowEvents.ShowMultiplesWindowPanel(_objectId, {
                            groupid: _objectId,
                            name: $(this).attr('title') || '群聊，暂时没有动态获取群名'
                        });
                    } else {
                        _chatWindowEvents.ShowSingleWindowPanel(_objectId, {
                            userid: _objectId,
                            nickname: $(this).attr('title') || '私聊，暂时没有动态获取昵称'
                        })
                    }
                });
            },
            bindSearch: function() {
                let _this = this;
                //输入框正在输入时
                $('input[name=SearchKey]').on('input', function() {
                    let _searchKey = $(this).val();
                    console.log(_searchKey);
                    if (_searchKey.trim() === '') {
                        $.ajax({
                            url: 'https://www.fastmock.site/mock/992387632827a42b26d0a126c2acdea5/ChatPages/api/GetPanelSearchHistory',
                            type: 'POST',
                            data: { key: _searchKey },
                            dataType: 'json',
                            success: function(res) {
                                console.log(res)
                                _chatPanelEvents.panelSearchTemplate(res);
                            },
                            fail: function() {
                                console.log('获取搜索历史记录失败！')
                            }
                        })
                        return;
                    }
                    $.ajax({
                        url: 'https://www.fastmock.site/mock/992387632827a42b26d0a126c2acdea5/ChatPages/api/PanelSearch',
                        type: "POST",
                        data: { key: _searchKey },
                        dataType: 'json',
                        success: function(res) {
                            _chatPanelEvents.panelSearchTemplate(res);
                        },
                        fail: function() {

                        }
                    })
                    _this.bindSearchResultItem();
                });

                //输入框得到焦点时
                $('input[name=SearchKey]').on('focus', function() {
                    let _$this = $(this);
                    let _$searchResultPanel = _$this.parent().parent().find('.panel-body-search-result');
                    _$searchResultPanel.fadeIn(100);

                    if (!_$searchResultPanel.hasClass('show')) {
                        _$searchResultPanel.addClass('show');
                        $.ajax({
                            url: 'https://www.fastmock.site/mock/992387632827a42b26d0a126c2acdea5/ChatPages/api/GetPanelSearchHistory',
                            type: 'POST',
                            data: { key: _$this.val() },
                            dataType: 'json',
                            success: function(res) {
                                console.log(res)
                                _chatPanelEvents.panelSearchTemplate(res);
                            },
                            fail: function() {
                                console.log('获取搜索历史记录失败！')
                            }
                        })

                        $('.panel-search-clear-icon').fadeIn(100);
                        $('.panel-search-clear-icon').click(function() {
                            _$this.val('');
                            _$searchResultPanel.fadeOut(100);
                            _$searchResultPanel.removeClass('show');
                        });
                    }
                });
                $('.panel-body-search-result').off('mouseleave').on('mouseleave', function() {
                    $('input[name=SearchKey]').blur();
                    $('input[name=SearchKey]').val('');
                    $('.panel-search-clear-icon').fadeOut(100);
                    $(this).fadeOut(100);
                    $(this).removeClass('show');
                });
                //输入框失去焦点时
                // $('input[name=SearchKey]').on('blur', function() {
                //     let _$searchResultPanel = $(this).parent().parent().find('.panel-body-search-result');
                //     _$searchResultPanel.fadeOut(100);
                //     $(this).val('');
                // });
            },
            /** 绑定群聊列表点击 */
            bindGroups: function() {
                $('.panel-body-group-item').off('mouseenter').on('mouseenter', function() {
                    if ($(this).hasClass('empty')) return;
                    $(this).addClass('active');
                    $(this).find('.layui-col-xs2').removeClass('layui-col-xs2').addClass('layui-col-xs3');
                    $(this).find('.layui-col-xs7').removeClass('layui-col-xs7').addClass('layui-col-xs6');
                })
                $('.panel-body-group-item').off('mouseleave').on('mouseleave', function() {
                    if ($(this).hasClass('empty')) return;
                    $(this).removeClass('active');
                    $(this).find('.layui-col-xs3').eq(0).removeClass('layui-col-xs3').addClass('layui-col-xs2');
                    $(this).find('.layui-col-xs6').removeClass('layui-col-xs6').addClass('layui-col-xs7');
                })
                $('.panel-body-group-item').off('dblclick').on('dblclick', function() {
                    // console.log('获取聊天组的Id' + $(this).data('groupid'));
                    if ($(this).hasClass('empty')) return;
                    let _groupid = $(this).data('groupid');
                    _chatWindowEvents.ShowMultiplesWindowPanel(_groupid, {
                        groupid: _groupid,
                        name: $(this).attr('title') || '群聊，暂时没有动态获取群名'
                    });
                });
            },
            /** 绑定历史消息列表点击 */
            bindMsgList: function() {
                $('.panel-body-msglist-item').off('dblclick').on('dblclick', function() {
                    console.log('获取消息列表的Id' + $(this).data('msgid'));
                    console.log('获取消息列表类型' + $(this).data('type'));
                    console.log('获取消息列表类型的Id' + $(this).data('typeid'));
                    let _msgid = $(this).data('msgid'),
                        _objectId = $(this).data('typeid'),
                        _type = $(this).data('type');
                    if (_type === 'group') {
                        _chatWindowEvents.ShowMultiplesWindowPanel(_objectId, {
                            groupid: _objectId,
                            name: $(this).attr('title') || '群聊，暂时没有动态获取群名'
                        });
                    } else {
                        _chatWindowEvents.ShowSingleWindowPanel(_objectId, {
                            userid: _objectId,
                            nickname: $(this).attr('title') || '私聊，暂时没有动态获取昵称'
                        })
                    }
                });
            },
            /** 绑定面板列表按钮 */
            bindPanelTabsBtns: function() {
                $('.add-friend-group-btn').off('click').on('click', function() {
                    let _$this = $(this);
                    switch (_$this.data('type')) {
                        case 'AddFriend':
                            {
                                _chatPanelAddSearch.show();
                            }
                            break;
                        case 'AddFriendGroup':
                            {
                                _chatPanelFriendAndFriendGroup.addNewFriendGroup();
                            }
                            break;
                        case 'AddGroup':
                            {
                                _chatPanelGroup.addNewGroup();
                            }
                            break;
                        case 'ClearMsglist':
                            {
                                console.log('消息列表已经清空...')
                                // $.ajax({
                                //     url: 'https://www.fastmock.site/mock/992387632827a42b26d0a126c2acdea5/ChatPages/api/GetMsgList',
                                //     type: 'POST',
                                //     dataType: 'json',
                                //     success: function(res) {
                                let _template = `
                                    <ul class="panel-body-msglists">  
                                        <li class="panel-body-msglist-item empty" data-msgid="empty" data-typeid="empty" data-type="empty">暂时没有会话</li>
                                    </ul>
                                `;

                                $('.panel-body-msglist').html(_template);
                                //     },
                                //     fail: function() {
                                //         console.log('请求出错');
                                //     }
                                // });
                            }
                            break;
                    }

                });
            },
            /** 绑定聊天消息输入工具栏 */
            bindChatWindowTools: function(layero) {
                let _this = this;
                let _$container = $(layero[0]).find('.chat-window-content');
                let _currentLoginUser = _loginUser.get();
                let _tempSendImageId = '';
                //发送图片
                let _uploadImageIns = upload.render({
                    elem: $(layero[0]).find('.chat-window-send-img-btn'),
                    url: 'https://httpbin.org/post', //改成您自己的上传接口
                    before: function(obj) {
                        _tempSendImageId = _datetimeUtils.formatNumberTime(new Date());
                        _$container.append(_chatWindowEvents.SendImageMsg({
                            user: {
                                userid: _currentLoginUser.id,
                                nickname: _currentLoginUser.nickname,
                                avatar: _currentLoginUser.avatar
                            },
                            tempSendImageId: _tempSendImageId, //用于发送时候预览图片的Id
                            time: new Date(),
                            // src: res.files.file //本地文件
                            //  src:res.data.src //服务端文件
                        }));
                        element.render();
                        obj.preview(function(index, file, result) {
                            $(`#${_tempSendImageId}`).find('img.image').attr('src', result);
                            setTimeout(() => {
                                _$container.animate({ scrollTop: _$container.prop("scrollHeight") }, 10);
                            }, 500);
                        });
                    },
                    progress: function(n, elem) {
                        var percent = n + '%' //获取进度百分比
                        console.log(percent);
                        $(`#${_tempSendImageId} .send-image-progress-bar`).css('width', percent);
                        if (n >= 100) {
                            $(`#${_tempSendImageId} .send-image-progress`).fadeOut(10);
                            _this.bindPreviewImages(layero[0]);
                        }
                    },
                    done: function(res) {
                        //如果上传失败
                        if (res.code > 0) {
                            return layer.msg('上传失败');
                        }
                        //上传成功
                        console.log('图片发送成功');
                    },
                    error: function() {
                        console.log('图片发送失败');
                        let _$reuploadBtn = $(`#${_tempSendImageId} .reupload-image`);
                        _$reuploadBtn.fadeIn(10);
                        _$reuploadBtn.off('click').on('click', function() {
                            console.log('重新发送')
                            $(this).fadeOut(0);
                            _uploadImageIns.upload();
                        });
                    }
                });

                //发送视频
                upload.render({
                    elem: $(layero[0]).find('.chat-window-send-video-btn'),
                    url: 'https://httpbin.org/post', //改成您自己的上传接口
                    accept: 'video', //视频
                    before: function(obj) {
                        console.log('开始上传视频...')
                    },
                    done: function(res) {
                        layer.msg('上传成功');
                        //上传成功
                        console.log('图片发送成功');
                        _$container.append(_chatWindowEvents.SendVideoMsg({
                            user: {
                                userid: _currentLoginUser.id,
                                nickname: _currentLoginUser.nickname,
                                avatar: _currentLoginUser.avatar
                            },
                            time: new Date(),
                            src: res.files.file //本地文件
                                //  src:res.data.src //服务端文件
                        }));
                        _$container.animate({ scrollTop: _$container.prop("scrollHeight") }, 10);
                        console.log(res)
                    }
                });

                //发送文件
                upload.render({
                    elem: $(layero[0]).find('.chat-window-send-file-btn'),
                    url: 'https://httpbin.org/post', //改成您自己的上传接口
                    accept: 'file', //普通文件
                    exts: 'zip|rar|7z', //只允许上传压缩文件
                    before: function(obj) {
                        console.log('开始上传文件...')
                    },
                    done: function(res) {
                        layer.msg('上传成功');
                        console.log(res)
                    }
                });
            },
            /** 绑定聊天消息列表图片预览 */
            bindPreviewImages: function(layero) {
                setTimeout(() => {
                    layer.photos({
                        zIndex: layer.zIndex,
                        closeBtn: true,
                        shade: 0,
                        photos: $(layero).find('.main-user-msg-content'),
                        anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机（请注意，3.0之前的版本用shift参数）
                    });
                }, 600);
            },
            init: function() {
                this.bindSearch(); //测试  
                this.bindFootFuns();
            }
        }

        /** 存储用户登录 */
        const _loginUser = {
            get: function() {
                return JSON.parse(localStorage.getItem('LOGINUSER'));
            },
            set: function(user) {
                localStorage.setItem('LOGINUSER', JSON.stringify(user));
            }
        };

        /** 定义好友列表相关 */
        const chatPanel = {
            GetMyInfo: function() {
                $.ajax({
                    url: 'https://www.fastmock.site/mock/992387632827a42b26d0a126c2acdea5/ChatPages/api/GetMyInfo',
                    type: 'POST',
                    dataType: 'json',
                    success: function(res) {
                        _loginUser.set(res);
                        // console.log(res);
                        $('.panel-head-avatar').attr('src', res.atavar);
                        $('.panel-head-nickname>h5').text(res.nickname);
                        $('.panel-head-description').text(res.description);
                        $('.panel-head-description').attr('title', res.description);
                    },
                    fail: function() {
                        console.log('请求出错');
                    }
                });
            },
            GetFriends: function() {
                $.ajax({
                    url: 'https://www.fastmock.site/mock/992387632827a42b26d0a126c2acdea5/ChatPages/api/GetFriendList',
                    type: 'POST',
                    dataType: 'json',
                    success: function(res) {
                        let _template = '';
                        if (res.length <= 0) {
                            _template = `
                                <div class="layui-colla-item panel-body-friends-item empty">
                                    暂无好友
                                </div>
                            `;
                        }
                        res.forEach(function(item, index) {
                            let _userItemTemplate = '';
                            item.list.forEach(function(litem, lindex) {
                                let _isOnline = '',
                                    _isOnlineFlag = '';
                                if (litem.online) {
                                    _isOnlineFlag = 'is-online';
                                    _isOnline = `<img class="avatar online" title="在线" src="${litem.avatar}" alt="${litem.nickname}的头像">`;
                                } else {
                                    _isOnlineFlag = 'is-unline';
                                    _isOnline = `<img class="avatar unline" title="离线" src="${litem.avatar}" alt="${litem.nickname}的头像">`;
                                }
                                _userItemTemplate += `
                                    <div class="chat-panel-user-item ${_isOnlineFlag} user-${litem.id}" data-userid="${litem.id}"  data-nickname="${litem.nickname}" title="${litem.nickname}">
                                        <div class="panel-user-left">
                                            ${_isOnline}
                                        </div>
                                        <div class="panel-user-right">
                                            <h3>${litem.nickname}(<span>${litem.name||litem.id}</span>)</h3>
                                            <p class="description-text">${litem.description}</p>
                                            <p class="unline-text">[离线请留言]</p>
                                        </div>
                                    </div> 
                                `;
                            });
                            _template += `
                                <div class="layui-colla-item" id="FG${item.group.id}">
                                    <h2 class="layui-colla-title">${item.group.name.trim()}<span class="chat-user-friend-count">(2/${item.count})</span></h2>
                                    <div class="layui-colla-content chat-panel-user-list" id="FriendGroup${item.group.id}">
                                        ${_userItemTemplate}
                                    </div>
                                </div> 
                            `;
                        })
                        $('#UserFriendsList').html(_template);
                        element.render();
                        _bindEvents.bindShowMessage();

                    },
                    fail: function() {
                        console.log('请求出错');
                    }
                });

            },
            GetGroups: function() {
                $.ajax({
                    url: 'https://www.fastmock.site/mock/992387632827a42b26d0a126c2acdea5/ChatPages/api/GetGroups',
                    type: 'POST',
                    dataType: 'json',
                    success: function(res) {
                        let _template = ` <ul class="panel-body-groups">`;
                        if (res.groups.length <= 0) {
                            _template = `
                                <li class="panel-body-group-item empty" data-msgid="empty" data-typeid="empty" data-type="empty">暂时没有群聊</li>
                            `;
                        } else {
                            res.groups.forEach(function(item, index) {
                                _template += `
                                    <li class="panel-body-group-item" data-groupid="${item.id}" title="${item.name}">
                                        <div class="layui-row">
                                            <div class="layui-col-xs2">
                                                <img class="panel-group-avatar" src="${item.avatar}" alt="${item.name}">
                                            </div>
                                            <div class="layui-col-xs7">
                                                <h5 class="panel-group-name ${item.membership}">${item.name}</h5>
                                                <p class="panel-group-last-msg" title="${item.lastMsg.nickname}:${item.lastMsg.content}">${item.lastMsg.nickname}:${item.lastMsg.content}</p>
                                            </div>
                                            <div class="layui-col-xs3 layui-text-right">
                                                <span class="panel-group-time">${item.lastMsgTime}</span>
                                            </div>
                                        </div>
                                    </li> 
                                `;
                            });
                        }
                        _template += '</ul>';
                        $('.panel-body-group').html(_template);
                        _bindEvents.bindGroups();
                        //TODO:绑定事件
                    },
                    fail: function() {
                        console.log('请求出错');
                    }
                });
            },
            GetMsgList: function() {
                $.ajax({
                    url: 'https://www.fastmock.site/mock/992387632827a42b26d0a126c2acdea5/ChatPages/api/GetMsgList',
                    type: 'POST',
                    dataType: 'json',
                    success: function(res) {
                        let _template = `<ul class="panel-body-msglists">`;
                        if (res.list.length <= 0) {
                            _template = `
                                <li class="panel-body-msglist-item empty" data-msgid="empty" data-typeid="empty" data-type="empty">暂时没有会话</li>
                            `;
                        } else {
                            res.list.forEach(function(item, index) {
                                let _msg = ``;
                                if (item.type === 'group') {
                                    _msg = ` <p class="panel-msglist-last-msg">${item.lastMsg.nickname}:${item.lastMsg.content}</p>`;
                                } else {
                                    _msg = ` <p class="panel-msglist-last-msg">${item.lastMsg.content}</p>`;
                                }
                                _template += `
                                    <li class="panel-body-msglist-item" title="${item.name}" data-msgid="${item.id}"  data-typeid="${item.id}" data-type="${item.type}">
                                        <div class="layui-row">
                                            <div class="layui-col-xs2">
                                                <img class="panel-msglist-avatar" src="${item.avatar}" alt="${item.name}">
                                            </div>
                                            <div class="layui-col-xs7">
                                                <h5 class="panel-msglist-name ${item.membership}">${item.name}</h5>
                                                ${_msg}
                                            </div>
                                            <div class="layui-col-xs3 layui-text-right">
                                                <span class="panel-msglist-time">${item.lastMsg.time}</span>
                                            </div>
                                        </div>
                                    </li>
                                `;
                            });
                        }
                        _template += '</ul>';
                        $('.panel-body-msglist').html(_template);
                        _bindEvents.bindMsgList();
                        //TODO:绑定事件
                    },
                    fail: function() {
                        console.log('请求出错');
                    }
                });
            },
            init: function() {
                var _this = this;
                var _chatPanelInitTimer = setTimeout(() => {
                    clearTimeout(_chatPanelInitTimer);
                    _this.GetMyInfo();
                    _this.GetFriends();
                    _this.GetGroups();
                    _this.GetMsgList();
                }, 0);
            }
        }

        /** 添加好友和群聊搜索面板 */
        const _chatPanelAddSearch = {
            lock: false, //锁
            timer: null,
            usersData: [], //第一次加载的推荐用户的数据
            groupsData: [], //第一次加载的推荐群聊的数据
            ParseBool: function(boolStr) {
                if (boolStr === 'true') return true;
                else return false;
            },
            template: function(data) {
                return `
            <div class="layui-tab layui-tab-brief chatpanelsearch-container">
                <ul class="layui-tab-title">
                    <li class="layui-this chatpanelsearch-user-title">用户</li>
                    <li class="split-line"></li>
                    <li class="chatpanelsearch-group-title">群聊</li>
                </ul>
                <div class="layui-tab-content">
                    <div class="layui-tab-item layui-show chatpanelsearch-user-content">
                        <div class="chatpanelsearch-head">
                            <form class="layui-form" action="">
                                <input type="text" name="ChatPanelSearchUserInput" placeholder="请输入用户号码/用户昵称/关键字..." required lay-verify="required" autocomplete="off" class="layui-input search-key">
                                <i class="layui-icon layui-icon-close chatpanelsearch-clear-icon-btn" data-type="User" title="清空搜索"></i>
                                <select name="ChatPanelSearchUserSex" lay-verify="" class="select-sex">
                                    <option value="">性别（不限）</option>
                                    <option value="0">女生</option>
                                    <option value="1">男生</option> 
                                </select>
                                <select name="ChatPanelSearchUserAge" lay-verify="" class="select-age">
                                    <option value="">年龄（不限）</option>
                                    <option value="0">18岁以下</option>
                                    <option value="1">18-22岁</option> 
                                    <option value="2">23-26岁</option> 
                                    <option value="2">27-35岁</option> 
                                    <option value="2">35岁以上</option> 
                                </select>
                                <button type="button" class="layui-btn chatpanelsearch-user-btn"  lay-submit lay-filter="SearchUserBtn">搜索</button>
                            </form>
                        </div>
                        <div class="chatpanelsearch-body">
                            <h5 class="recommend-users-title">好友推荐</h5>
                            <a class="toggle-recommend toggle-recommend-users" isback="false" href="javascript:">换一批</a>
                            <ul class="chatpanelsearch-recommends chatpanelsearch-users-recommends">
                                <li class="chatpanelsearch-recommend-item">
                                    <div class="left">
                                        <img class="avatar" src="images/avatar/avatar_025.jpeg" alt="">
                                    </div>
                                    <div class="right">
                                        <h5 class="nickname">小鱼呆猫儿</h5>
                                        <p class="description">哽咽的话语 </p>
                                        <button type="button" class="layui-btn layui-btn-xs recommend-item-add-friend-btn"><i class="layui-icon">&#xe654;</i>好友</button>
                                    </div>
                                </li> 
                            </ul>
                            <div id="ChatPanelSearchUsersPaging"><!-- 用户搜索分页 --></div>
                        </div>
                    </div>
                    <div class="layui-tab-item"></div>
                    <div class="layui-tab-item chatpanelsearch-group-content">
                        <div class="chatpanelsearch-head">
                            <form class="layui-form" action="">
                                <input type="text" name="ChatPanelSearchGroupInput" placeholder="请输入群聊号码/群聊名称/关键字..." required lay-verify="required" autocomplete="off" class="layui-input search-key">
                                <i class="layui-icon layui-icon-close chatpanelsearch-clear-icon-btn" data-type="Group" title="清空搜索"></i>
                                <button type="button" class="layui-btn chatpanelsearch-group-btn" lay-submit lay-filter="SearchGroupBtn">搜索</button>
                            </form>
                        </div>
                        <div class="chatpanelsearch-body">
                            <h5 class="recommend-groups-title">群聊推荐</h5>
                            <a class="toggle-recommend toggle-recommend-groups" isback="false" href="javascript:">换一批</a>
                            <ul class="chatpanelsearch-recommends chatpanelsearch-groups-recommends">
                                <li class="chatpanelsearch-recommend-item">
                                    <div class="left">
                                        <img class="avatar" src="images/avatar/avatar_025.jpeg" alt="">
                                    </div>
                                    <div class="right">
                                        <h5 class="nickname">吃土少女的小窝</h5>
                                        <p class="description">群主很懒，什么都没有留下呢，哈哈哈 </p>
                                        <p class="count"><i class="layui-icon layui-icon-group"></i><span>30/50</span></p>
                                        <button type="button" class="layui-btn layui-btn-xs recommend-item-add-group-btn"><i class="layui-icon">&#xe654;</i>加群</button>
                                    </div>
                                </li> 
                            </ul>
                            <div id="ChatPanelSearchGroupsPaging"><!-- 群聊搜索分页 --></div>
                        </div>
                    </div>
                </div>
            </div> 
            `;
            },
            renderUsers: function(data, searchKey) {
                let _template = '';
                if (data > 0) {
                    for (let index = 0; index < 12; index++) {
                        _template += `
                        <li class="chatpanelsearch-recommend-item">
                            <div class="left">
                                <img class="avatar" src="images/avatar/avatar_0${index + 10}.jpeg" alt="">
                            </div>
                            <div class="right">
                                <h5 class="nickname">提拉米苏${index + 1}号猫</h5>
                                <p class="description">第${index + 1}号猫,很懒，没有发表任何个性签名</p>
                                <button type="button" data-userid="${index}" class="layui-btn layui-btn-xs recommend-item-add-friend-btn"><i class="layui-icon">&#xe654;</i>好友</button>
                            </div>
                        </li> 
                    `;
                    }
                } else {
                    _template = `
                    <li class="chatpanelsearch-recommend-item empty">
                        没有搜索 ${searchKey} 相关的用户。
                    </li>
                `;
                }
                $('.chatpanelsearch-users-recommends').html(_template);
                $('#ChatPanelSearchUsersAndGroups').find('.recommend-item-add-friend-btn').css({
                    'color': chatSetting.get().fontColor,
                    'background-color': chatSetting.get().bgColor
                });
                this.bindAddFriendBtn();
            },
            renderGroups: function(data, searchKey) {
                let _template = '';
                if (data > 0) {
                    for (let index = 0; index < 12; index++) {
                        let _countMember = Math.ceil(Math.random() * 10) * 10;
                        _template += `
                    <li class="chatpanelsearch-recommend-item">
                        <div class="left">
                            <img class="avatar" src="images/avatar/avatar_0${23 + index}.jpeg" alt="">
                        </div>
                        <div class="right">
                            <h5 class="nickname">奇创云第${index + 1}号开发组</h5>
                            <p class="description">群主很懒，没有留下任何的加群说明</p>
                            <p class="count"><i class="layui-icon layui-icon-group"></i><span>${_countMember - 5}/${_countMember}</span></p>
                            <button type="button" data-groupid="${index}" class="layui-btn layui-btn-xs recommend-item-add-group-btn"><i class="layui-icon">&#xe654;</i>加群</button>
                        </div>
                    </li> 
                    `;

                    }
                } else {
                    _template = `
                    <li class="chatpanelsearch-recommend-item empty">
                        没有搜索 ${searchKey} 相关的群聊。
                    </li>
                `;
                }
                $('.chatpanelsearch-groups-recommends').html(_template);
                $('#ChatPanelSearchUsersAndGroups').find('.chatpanelsearch-group-btn').css({
                    'color': chatSetting.get().fontColor,
                    'background-color': chatSetting.get().bgColor
                });
                this.bindAddGroupBtn();
            },
            renderUsersPaging: function() {
                console.log(chatSetting.get().bgColor)
                    //完整功能
                laypage.render({
                    elem: 'ChatPanelSearchUsersPaging',
                    count: 100,
                    theme: '#ff80ab',
                    layout: ['count', 'prev', 'page', 'next', 'limit'],
                    jump: function(obj) {
                        console.log(obj)
                    }
                });
            },
            renderGroupsPaging: function() {
                //完整功能
                laypage.render({
                    elem: 'ChatPanelSearchGroupsPaging',
                    count: 100,
                    theme: '#ff80ab',
                    layout: ['count', 'prev', 'page', 'next', 'limit'],
                    jump: function(obj) {
                        console.log(obj)
                    }
                });
            },
            userSearch: function() {
                let _this = this;
                form.on('submit(SearchUserBtn)', function(data) {
                    if (!_this.lock) {
                        _this.lock = true;

                        let _$title = $('.recommend-users-title'),
                            _$backBtn = $('.toggle-recommend-users'),
                            _$paging = $('#ChatPanelSearchUsersPaging');

                        _$title.text('搜索结果');
                        _$backBtn.attr('isback', true);
                        _$backBtn.text('返回');

                        _this.renderUsersPaging();

                        _$paging.fadeIn(10);

                        _chatPanelAddSearch.renderUsers(1);
                        _this.toggleUsers(); //绑定返回按钮
                        // $.ajax({
                        //     url: '',
                        //     type: 'POST',
                        //     data: {key:_$searchKeyInput.val()},
                        //     dataType: 'json',
                        //     success: function(res) {

                        console.log("查找用户：");
                        console.log(data.field);

                        //     },
                        //     fail: function() {
                        //         console.log('查找用户失败！')
                        //     }
                        // })
                        setTimeout(() => {
                            _this.lock = false;
                        }, 1000)
                    }
                })
            },
            groupSearch: function() {
                let _this = this;
                form.on('submit(SearchGroupBtn)', function(data) {

                    if (!_this.lock) {
                        _this.lock = true;

                        let _$title = $('.recommend-groups-title'),
                            _$backBtn = $('.toggle-recommend-groups'),
                            _$paging = $('#ChatPanelSearchGroupsPaging');
                        _$title.text('搜索结果');
                        _$backBtn.attr('isback', true);
                        _$backBtn.text('返回');

                        _this.renderGroupsPaging(); //渲染分页插件 
                        _$paging.fadeIn(10); //显示分页

                        _this.renderGroups(1); //渲染搜索结果列表
                        _this.toggleGroups(); //绑定返回按钮
                        // $.ajax({
                        //     url: '',
                        //     type: 'POST',
                        //     data: {key:_$searchKeyInput.val()},
                        //     dataType: 'json',
                        //     success: function(res) {

                        console.log("查找群聊：");
                        console.log(data.field);
                        //     },
                        //     fail: function() {
                        //         console.log('查找群聊失败！')
                        //     }
                        // })
                        setTimeout(() => {
                            _this.lock = false;
                        }, 1000)
                    }
                })
            },
            clearSearchInput: function() {
                $('.chatpanelsearch-clear-icon-btn').off('click').on('click', function(e) {
                    let _$this = $(this);
                    if (_$this.data('type') === 'User') {
                        console.log('清空查找用户...');
                        $('input[name=ChatPanelSearchUserInput]').val('');
                    } else {
                        console.log('清空查找群聊...');
                        $('input[name=ChatPanelSearchGroupInput]').val('');
                    }
                })
            },
            toggleUsers: function() {
                let _this = this;
                $('.toggle-recommend-users').off('click').on('click', function() {
                    let _$this = $(this);
                    console.log(_$this.attr('isback'))
                    console.log(_this.ParseBool(_$this.attr('isback')))
                    if (_this.ParseBool(_$this.attr('isback'))) {
                        $('.recommend-users-title').text('用户推荐');
                        $('#ChatPanelSearchUsersPaging').fadeOut(10);

                        _$this.attr('isback', false);
                        _$this.text('换一批');
                        //正式数据
                        //_this.renderUsers(_this.usersData); 
                        //模拟数据
                        _this.renderUsers(1);
                    } else {
                        console.log('状态锁：' + _this.lock)
                        if (!_this.lock) {
                            _this.lock = true;
                            //TODO:换一批 推荐用户
                            // $.ajax({
                            //     url: '',
                            //     type: 'POST',
                            //     data: {},
                            //     dataType: 'json',
                            //     success: function(res) {
                            //         _this.usersData = res.data;
                            //         _this.renderUsers(_this.usersData);

                            //     },
                            //     fail: function(err) {
                            //         console.log('加载默认推荐用户失败！')
                            //     }
                            // })
                            setTimeout(() => {
                                _this.lock = false;
                            }, 1000)
                        }
                    }
                })

            },
            toggleGroups: function() {
                let _this = this;
                $('.toggle-recommend-groups').off('click').on('click', function() {
                    let _$this = $(this);
                    if (_this.ParseBool(_$this.attr('isback'))) {
                        $('.recommend-groups-title').text('用户推荐');
                        $('#ChatPanelSearchGroupsPaging').fadeOut(10);

                        _$this.attr('isback', false);
                        _$this.text('换一批');
                        //正式数据
                        //_this.renderGroups(_this.groupsData); 
                        //模拟数据
                        _this.renderGroups(1);
                        console.log('换一批')
                    } else {
                        if (!_this.lock) {
                            _this.lock = true;
                            //TODO:换一批 推荐群聊
                            // $.ajax({
                            //     url: '',
                            //     type: 'POST',
                            //     data: {},
                            //     dataType: 'json',
                            //     success: function(res) {
                            //         _this.groupsData = res.data;
                            //         _this.renderGroups(_this.groupsData);
                            _this.renderGroups(1);
                            //     },
                            //     fail: function(err) {
                            //         console.log('加载默认推荐群聊失败！')
                            //     }
                            // })
                            setTimeout(() => {
                                _this.lock = false;
                            }, 1000)
                        }

                    }
                })
            },
            /** 绑定添加好友按钮 */
            bindAddFriendBtn: function() {
                let _this = this;
                $('.recommend-item-add-friend-btn').off('click').on('click', function() {
                    if (!_this.lock) {
                        _this.lock = true;

                        let _$this = $(this);
                        console.log('添加好友，ID：' + _$this.data('userid'));

                        _chatPanelFriendAndFriendGroup.addNewFriend(_$this.data('userid'));
                        //TODO:显示请求状态

                        // _TzRequestEvents.request({
                        //     url: '/api/AddChatFriend',
                        //     type: 'POST',
                        //     data: {
                        //         UserId: _$this.data('userid')
                        //     }
                        // }).then(res => {
                        //     console.log(res);
                        //     _this.lock = false;
                        // }).catch(err => {
                        //     _this.lock = false;
                        //     console.error('请求失败...');
                        // })

                        /** 模拟请求响应 解除锁 */
                        clearTimeout(_this.timer);
                        _this.timer = setTimeout(() => {
                            _this.lock = false;
                        }, 1000);
                    }
                })
            },
            /** 绑定添加群聊按钮 */
            bindAddGroupBtn: function() {
                let _this = this;
                $('.recommend-item-add-group-btn').off('click').on('click', function() {
                    if (!_this.lock) {
                        _this.lock = true;

                        let _$this = $(this);
                        console.log('添加群聊，ID：' + _$this.data('groupid'));
                        _chatPanelGroup.joinGroup(_$this.data('groupid'));
                        // _TzRequestEvents.request({
                        //     url: '/api/JoinGroup',
                        //     type: 'POST',
                        //     data: {
                        //         UserId: _$this.data('groupid')
                        //     }
                        // }).then(res => {
                        //     console.log(res);
                        // }).catch(err => {

                        // })

                        _this.timer = setTimeout(() => {
                            clearTimeout(_this.timer);
                            _this.lock = false;
                        }, 1000);
                    }

                })
            },
            bindEvents: function() {
                this.toggleUsers();
                this.toggleGroups();
                this.userSearch();
                this.groupSearch();
                this.clearSearchInput();
            },
            show: function() {
                let _this = this;
                layer.open({
                    type: 1,
                    skin: 'chatpanelsearch-usersandgroups',
                    id: 'ChatPanelSearchUsersAndGroups',
                    title: '查找',
                    shadeClose: false,
                    shade: 0,
                    area: ['800px', '500px'],
                    resize: false,
                    content: _this.template(),
                    success: function(layero) {
                        let _chatSettings = chatSetting.get();
                        form.render();
                        element.render();
                        _this.default();

                        //设置颜色 
                        $(layero[0]).find('.layui-layer-title,.layui-tab-title').css({
                            'color': _chatSettings.fontColor,
                            'background-color': _chatSettings.bgColor
                        });
                        $(layero[0]).find('.layui-layer-title,.layui-tab-title,.chatpanelsearch-user-btn,.recommend-item-add-group-btn').css({
                            'color': _chatSettings.fontColor,
                            'background-color': _chatSettings.bgColor
                        });
                        $(layero[0]).find('.chatpanelsearch-user-title.layui-this').css('color', _chatSettings.fontColor);
                        $(layero[0]).find('.toggle-recommend').css('color', _chatSettings.bgColor);
                    }
                });
            },
            default: function() {
                let _this = this;

                // $.ajax({
                //     url: '',
                //     type: 'POST',
                //     data: {},
                //     dataType: 'json',
                //     success: function(res) {
                //         _this.usersData = res.data;
                //         _this.renderUsers(_this.usersData);
                _this.renderUsers(1);
                //     },
                //     fail: function(err) {
                //         console.log('加载默认推荐用户失败！')
                //     }
                // })

                // $.ajax({
                //     url: '',
                //     type: 'POST',
                //     data: {},
                //     dataType: 'json',
                //     success: function(res) {
                //         _this.groupsData = res.data;
                //         _this.renderGroups(_this.groupsData);
                _this.renderGroups(1);
                //     },
                //     fail: function(err) {
                //         console.log('加载默认推荐群聊失败！')
                //     }
                // })
                _this.bindEvents();
            }
        }


        /** 定义好友和分组的操作*/
        const _chatPanelFriendAndFriendGroup = {
            lock: false, //请求锁
            timer: null,
            addNewFriendGroupTemplate: function() {
                return `
                    <div class="chatpanel chatpanel-addnewfriendtogroup-container">
                        <form class="layui-form" action="">
                            <div class="layui-form-item">
                                <label class="layui-form-label">分组名称</label>
                                <div class="layui-input-block">
                                    <input type="text" name="NewFriendGroupName" required lay-verify="required" placeholder="请输入新的分组名称... " autocomplete="off" class="layui-input ">
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <div class="layui-input-block">
                                    <button class="layui-btn chat-default-btn" lay-submit lay-filter="ChatAddNewFriendGroupBtn">确定添加</button>
                                    <button type="button" class="layui-btn layui-btn-primary chat-cancel-btn cancel-addnewfriendgroup-btn">取消添加</button>
                                </div>
                            </div>
                        </form>
                    </div>
                `;
            },
            addNewFriendTemplate: function() {
                return `
                    <div class="chatpanel chatpanel-addnewfriend-container">
                        <div class="chatpanel-addnewfriend-info">
                            <img class="avatar" src="images/avatar/avatar_002.png" alt=" ">
                            <div class=" ">
                                <h5 class="nickname">小鱼呆猫儿</h5>
                                <p>性别：<span>女生</span></p>
                            </div>
                        </div>
                        <form class="layui-form" action=" ">
                            <input type="hidden" value="002" name="AddNewFriendId">
                            <div class="layui-form-item ">
                                <label class="layui-form-label">备注姓名</label>
                                <div class="layui-input-block">
                                    <input type="text" name="NickName" required lay-verify="required" placeholder="请输入Ta的备注..." autocomplete="off" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <label class="layui-form-label">选择分组</label>
                                <div class="layui-input-block ">
                                    <select name="FriendGroupId" lay-verify=" " lay-search>
                                        <option value="group001" selected>我的好友</option>
                                        <option value="group002">我的同学</option>
                                        <option value="group003">我的老师</option>
                                        <option value="group004">邻家小姐姐</option>
                                    </select>
                                </div>
                            </div>
                            <div class="layui-form-item layui-form-text">
                                <label class="layui-form-label">验证信息</label>
                                <div class="layui-input-block">
                                    <textarea name="AddFriendDescription" placeholder="请输入验证信息" class="layui-textarea"></textarea>
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <div class="layui-input-block">
                                    <button class="layui-btn chat-addnewfriend-btn" lay-submit lay-filter="ChatAddNewFriend">确定添加</button>
                                    <button type="button" class="layui-btn layui-btn-primary chat-cancel-btn cancel-addnewfriend-btn">取消添加</button>
                                </div>
                            </div>
                        </form>
                    </div>
                `;
            },
            moveToGroupTemplate: function() {
                return ` 
                    <div class="chatpanel chatpanel-movefriendtogroup-container">
                        <div class="chatpanel-movefriendtogroup-info">
                            <img class="avatar" src="images/avatar/avatar_002.png" alt=" ">
                            <div class=" ">
                                <h5 class="nickname"><span class="remarkname">小呆猫</span>（<span class="old-nickname">小鱼呆猫儿</span>）</h5>
                                <p>来自分组：<span>我的好友</span></p>
                            </div>
                        </div>
                        <form class="layui-form" action=" ">
                            <!-- 旧的分组Id -->
                            <input type="hidden" value="002" name="MoveToGroupOldId">
                            <!-- 好友的Id -->
                            <input type="hidden" value="002" name="MoveToGroupFriendId">
                            <div class="layui-form-item">
                                <label class="layui-form-label">选择分组</label>
                                <div class="layui-input-block">
                                    <select name="FriendGroupId" lay-verify=" " lay-search>
                                        <option value="group001" selected>我的好友</option>
                                        <option value="group002">我的同学</option>
                                        <option value="group003">我的老师</option>
                                    </select>
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <div class="layui-input-block">
                                    <button class="layui-btn chat-movefriendtogroup-btn" lay-submit lay-filter="ChatMoveFriendToGroup">确定移动</button>
                                    <button type="button" class="layui-btn layui-btn-primary chat-cancel-btn cancel-movefriendtogroup-btn">取消移动</button>
                                </div>
                            </div>
                        </form>
                    </div>
                `;
            },
            changeNicknameTemplate: function() {
                return `
                    <div class="chatpanel chatpanel-changefriendnickname-container">
                        <form class="layui-form" action="">
                            <div class="layui-form-item">
                                <label class="layui-form-label">好友备注</label>
                                <div class="layui-input-block">
                                    <input type="text" name="NewFriendNickName" required lay-verify="required" placeholder="请输入新的好友备注..." autocomplete="off" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <div class="layui-input-block">
                                    <button class="layui-btn chat-default-btn" lay-submit lay-filter="ChatChangeFriendNicknameBtn">确定修改</button>
                                    <button type="button" class="layui-btn layui-btn-primary chat-cancel-btn cancel-changefriendnickname-btn">取消</button>
                                </div>
                            </div>
                        </form>
                    </div>
                `;
            },
            changeFriendGroupNameTemplate: function() {
                return `
                    <div class="chatpanel chatpanel-changefriendgroupname-container">
                        <form class="layui-form" action="">
                            <div class="layui-form-item">
                                <label class="layui-form-label ">好友备注</label>
                                <div class="layui-input-block ">
                                    <input type="text" name="NewFriendGroupName" required lay-verify="required" placeholder="请输入新的分组名称..." autocomplete="off" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <div class="layui-input-block">
                                    <button class="layui-btn chat-default-btn" lay-submit lay-filter="ChatpanelChangeFriendGroupNameBtn">确定修改</button>
                                    <button type="button" class="layui-btn layui-btn-primary chat-cancel-btn cancel-changefriendgroupname-btn">取消</button>
                                </div>
                            </div>
                        </form>
                    </div>
                `;
            },
            addNewFriendGroup: function() {
                let _this = this;
                layer.open({
                    type: 1,
                    skin: 'chatpanel-addnewfriendgroup',
                    id: 'ChatpanelAddNewFriendGroup',
                    title: '添加新的好友分组',
                    shadeClose: false,
                    shade: 0,
                    area: ['450px'],
                    resize: false,
                    content: _this.addNewFriendGroupTemplate(),
                    success: function(layero) {

                        let _$cancelBtn = $(layero[0]).find('.chat-cancel-btn');

                        _$cancelBtn.off('click').on('click', function() {
                            layer.close($(layero[0]).attr('times'));
                        });

                        form.render();
                        //监听提交
                        form.on('submit(ChatAddNewFriendGroupBtn)', function(data) {
                            if (!_this.lock) {
                                _this.lock = true;
                                layer.msg(JSON.stringify(data.field));

                                let _tempIndex = $('#UserFriendsList>.layui-colla-item').length;
                                console.log(_tempIndex)
                                let _template = `
                                    <div class="layui-colla-item" id="FG004">
                                        <h2 class="layui-colla-title">${data.field.NewFriendGroupName+(_tempIndex+1)}<span class="chat-user-friend-count">(0/0)</span></h2>
                                        <div class="layui-colla-content chat-panel-user-list" id="FriendGroupgroup004"></div>
                                    </div> 
                                `;
                                $('#UserFriendsList').append(_template);
                                element.render();

                                _this.timer = setTimeout(() => {
                                    clearTimeout(_this.timer);
                                    _this.lock = false;
                                    layer.close($(layero[0]).attr('times'));
                                }, 1500);
                            }

                            return false;
                        });
                    }
                })
            },
            addNewFriend: function(userid) {
                let _this = this;
                layer.open({
                    type: 1,
                    skin: 'chatpanel-addnewfriend',
                    id: 'ChatpanelAddNewFriend',
                    title: '添加好友',
                    shadeClose: false,
                    shade: 0,
                    area: ['450px'],
                    resize: false,
                    content: _this.addNewFriendTemplate(),
                    success: function(layero) {

                        let _$cancelBtn = $(layero[0]).find('.chat-cancel-btn');

                        _$cancelBtn.off('click').on('click', function() {
                            layer.close($(layero[0]).attr('times'));
                        });

                        form.render();
                        //监听提交
                        form.on('submit(ChatAddNewFriend)', function(data) {
                            if (!_this.lock) {
                                _this.lock = true;
                                layer.msg(JSON.stringify(data.field));
                                //TODO:ajax

                                //这里应该是发送验证信息，下面添加只是为了做演示 跳过验证信息步骤

                                let _isOnline = true,
                                    _isOnlineTemplate = '',
                                    _isOnlineFlag = '',
                                    _nickname = $(layero[0]).find('h5.nickname').text(),
                                    _avatar = $(layero[0]).find('.chatpanel-addnewfriend-info>img.avatar').attr('src');
                                if (_isOnline) {
                                    _isOnlineFlag = 'is-online';
                                    _isOnlineTemplate = `<img class="avatar online" title="在线" src="${_avatar}" alt="${data.field.NickName||_nickname}的头像">`;
                                } else {
                                    _isOnlineFlag = 'is-unline';
                                    _isOnlineTemplate = `<img class="avatar unline" title="离线" src="${_avatar}" alt="${data.field.NickName||_nickname}的头像">`;
                                }
                                let _userItemTemplate = `
                                    <div class="chat-panel-user-item ${_isOnlineFlag} user-${data.field.AddNewFriendId}" data-userid="${data.field.AddNewFriendId}"  data-nickname="${data.field.NickName||_nickname}" title="${data.field.NickName||_nickname}">
                                        <div class="panel-user-left">
                                            ${_isOnlineTemplate }
                                        </div>
                                        <div class="panel-user-right">
                                            <h3>${data.field.NickName}(<span>${_nickname}</span>)</h3>
                                            <p class="description-text">${data.field.Description||'这个人很懒，没有填写签名信息呢...'}</p>
                                            <p class="unline-text">[离线请留言]</p>
                                        </div>
                                    </div> 
                                `;
                                $(`#FriendGroup${data.field.FriendGroupId}`).append(_userItemTemplate);
                                element.render();
                                _bindEvents.bindShowMessage();
                                clearTimeout(_this.timer);
                                _this.timer = setTimeout(() => {
                                    _this.lock = false;
                                }, 1500);
                            }

                            return false;
                        });
                    }
                })
            },
            moveToGroup: function() {
                let _this = this;
                layer.open({
                    type: 1,
                    skin: 'chatpanel-movefriendtogroup',
                    id: 'ChatpanelMoveFriendToGroup',
                    title: '移动好友到分组',
                    shadeClose: false,
                    shade: 0,
                    area: ['450px'],
                    resize: false,
                    content: _this.moveToGroupTemplate(),
                    success: function(layero) {

                        let _$cancelBtn = $(layero[0]).find('.chat-cancel-btn');

                        _$cancelBtn.off('click').on('click', function() {
                            layer.close($(layero[0]).attr('times'));
                        });

                        form.render();
                        //监听提交
                        form.on('submit(ChatMoveFriendToGroup)', function(data) {
                            if (!_this.lock) {
                                _this.lock = true;
                                layer.msg(JSON.stringify(data.field));

                                clearTimeout(_this.timer);
                                _this.timer = setTimeout(() => {
                                    _this.lock = false;
                                }, 1500);
                            }

                            return false;
                        });
                    }
                })
            },
            /** 修改好友昵称*/
            changeNickname: function(userid) {
                let _this = this;
                layer.open({
                    type: 1,
                    skin: 'chatpanel-changefriendnickname',
                    id: 'ChatpanelChangeFriendNickname',
                    title: `正在修改 ${userid} 的好友备注`,
                    shadeClose: false,
                    shade: 0,
                    area: ['450px'],
                    resize: false,
                    content: _this.changeNicknameTemplate(),
                    success: function(layero) {

                        let _$cancelAddNewFriendBtn = $(layero[0]).find('.chat-cancel-btn');

                        _$cancelAddNewFriendBtn.off('click').on('click', function() {
                            layer.close($(layero[0]).attr('times'));
                        });

                        form.render();
                        //监听提交
                        form.on('submit(ChatChangeFriendNicknameBtn)', function(data) {
                            if (!_this.lock) {
                                _this.lock = true;
                                layer.msg(JSON.stringify(data.field));

                                clearTimeout(_this.timer);
                                _this.timer = setTimeout(() => {
                                    _this.lock = false;
                                }, 1500);
                            }

                            return false;
                        });
                    }
                })
            },
            /** 修改分组名称*/
            changeFriendGroupName: function(groupid) {
                let _this = this;
                layer.open({
                    type: 1,
                    skin: 'chatpanel-changefriendgroupname',
                    id: 'ChatpanelChangeFriendGroupName',
                    title: `正在修改 ${groupid} 的分组名称`,
                    shadeClose: false,
                    shade: 0,
                    area: ['450px'],
                    resize: false,
                    content: _this.changeFriendGroupNameTemplate(),
                    success: function(layero) {

                        let _$cancelAddNewFriendBtn = $(layero[0]).find('.chat-cancel-btn');

                        _$cancelAddNewFriendBtn.off('click').on('click', function() {
                            layer.close($(layero[0]).attr('times'));
                        });

                        form.render();
                        //监听提交
                        form.on('submit(ChatpanelChangeFriendGroupNameBtn)', function(data) {
                            if (!_this.lock) {
                                _this.lock = true;
                                layer.msg(JSON.stringify(data.field));

                                clearTimeout(_this.timer);
                                _this.timer = setTimeout(() => {
                                    _this.lock = false;
                                }, 1500);
                            }

                            return false;
                        });
                    }
                })
            },
            /** 删除好友*/
            deleteFriend: function(userid) {
                layer.confirm(`您确定要删除 ${userid} 吗？`, {
                    skin: 'chat-deleteconfirm delete-friend',
                    id: 'DeleteFriendGroup',
                    btn: ['确认删除', '取消'], //按钮
                    btnAlign: 'c',
                    shade: 0 //不显示遮罩
                }, function() {
                    layer.msg('删除成功', {
                        icon: 1
                    });
                }, function() {
                    layer.msg('取消删除', {
                        icon: 2
                    });
                });
            },
            /** 删除好友分组*/
            deleteFriendGroup: function(groupid) {
                layer.confirm(`您确定要删除 ${groupid} 吗？`, {
                    skin: 'chat-deleteconfirm delete-friendgroup',
                    id: 'DeleteFriendGroup',
                    btn: ['确认删除', '取消'], //按钮
                    btnAlign: 'c',
                    shade: 0 //不显示遮罩
                }, function() {
                    layer.msg('删除成功', {
                        icon: 1
                    });
                }, function() {
                    layer.msg('取消删除', {
                        icon: 2
                    });
                });
            }
        };

        /** 定义群聊相关*/
        const _chatPanelGroup = {
            lock: false,
            timer: null,
            addNewGroupTemplate: function() {
                return `
                    <div class="chatpanel chatpanel-addnewgroup-container"> 
                        <div class="layui-upload chatpanel-addnewgroup-upload"> 
                            <div class="addnewgroup-upload-tip">选择头像</div>
                            <div class="addnewgroup-upload-image">
                                <img class="layui-upload-img" title="选择群头像" src="images/icons/icon_new_group_avatar.png" id="NewGroupAvatar"> 
                            </div> 
                        </div>
                        <form class="layui-form" action=" "> 
                            <div class="layui-form-item">
                                <label class="layui-form-label">群聊名称</label>
                                <div class="layui-input-block ">
                                    <input type="text" name="GroupName" required lay-verify="required" placeholder="请输入群聊名称..." autocomplete="off" class="layui-input">
                                </div>
                            </div> 
                            <div class="layui-form-item layui-form-text">
                                <label class="layui-form-label">群聊描述</label>
                                <div class="layui-input-block">
                                    <textarea name="AddFriendDescription" placeholder="请输入群聊描述信息" class="layui-textarea"></textarea>
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <div class="layui-input-block">
                                    <button class="layui-btn chat-addnewfriend-btn" lay-submit lay-filter="ChatAddNewGroupBtn">确定创建</button>
                                    <button type="button" class="layui-btn layui-btn-primary chat-cancel-btn cancel-addnewgroup-btn">取消创建</button>
                                </div>
                            </div>
                        </form>
                    </div> 
                `;
            },
            addNewGroup: function() {
                let _this = this;
                layer.open({
                    type: 1,
                    skin: 'chatpanel-addnewgroup',
                    id: 'ChatpanelAddNewGroup',
                    title: '创建群聊（群聊）',
                    shadeClose: false,
                    shade: 0,
                    area: ['450px'],
                    resize: false,
                    content: _this.addNewGroupTemplate(),
                    success: function(layero) {
                        let _defaultGroupAvatar = $(layero[0]).find('.addnewgroup-upload-image>img').attr('src');
                        let _$cancelBtn = $(layero[0]).find('.chat-cancel-btn');

                        _$cancelBtn.off('click').on('click', function() {
                            layer.close($(layero[0]).attr('times'));
                        });

                        //选完文件后不自动上传
                        let _uploadInst = upload.render({
                            elem: '#NewGroupAvatar',
                            url: 'https://httpbin.org/post', //改成您自己的上传接口  
                            before: function(obj) {
                                obj.preview(function(index, file, result) {
                                    $('#NewGroupAvatar').attr('src', result); //图片链接（base64）
                                });
                            },
                            done: function(res) {
                                layer.msg('上传成功');
                                console.log(res)
                            },
                            error: function() {
                                //演示失败状态，并实现重传
                                // var demoText = $('#demoText');
                                // demoText.html('<span style="color: #FF5722;">上传失败</span> <a class="layui-btn layui-btn-xs demo-reload">重试</a>');
                                // demoText.find('.demo-reload').on('click', function() {
                                //     _uploadInst.upload();
                                // });
                                console.log('上传失败');
                            }
                        });

                        form.render();
                        //监听提交
                        form.on('submit(ChatAddNewGroupBtn)', function(data) {
                            if (!_this.lock) {
                                _this.lock = true;
                                layer.msg(JSON.stringify(data.field));

                                if (data.field.GroupName.trim() === '') return false;

                                let _tempAvatar = $(layero[0]).find('.addnewgroup-upload-image>img').attr('src');
                                let _newAvatar = _defaultGroupAvatar === _tempAvatar ? 'images/groups/defaultGroupAvatar.jpg' : _tempAvatar;

                                let _tempIndex = $('.panel-body-groups>.panel-body-group-item').length;
                                let _template = `
                                    <li class="panel-body-group-item" data-groupid="new${_tempIndex+1}" title="${data.field.GroupName+(_tempIndex+1)}">
                                        <div class="layui-row">
                                            <div class="layui-col-xs2">
                                                <img class="create-new-icon" src="../images/icons/icon_new_group.png">
                                                <img class="panel-group-avatar" src="${_newAvatar}" alt="新的群聊名称">
                                            </div>
                                            <div class="layui-col-xs7">
                                                <h5 class="panel-group-name">${data.field.GroupName+(_tempIndex+1)}</h5>
                                                <p class="panel-group-last-msg" title="系统消息:提拉米苏的呆猫 创建了群聊...">系统消息:创建成功。</p>
                                            </div>
                                            <div class="layui-col-xs3 layui-text-right">
                                                <span class="panel-group-time">2020-02-04</span>
                                            </div>
                                        </div>
                                    </li> 
                                `;
                                $(_template).prependTo('.panel-body-groups');
                                _bindEvents.bindGroups();

                                clearTimeout(_this.timer);
                                _this.timer = setTimeout(() => {
                                    _this.lock = false;
                                }, 1500);
                            }

                            return false;
                        });
                    }
                })
            },
            deleteGroup: function(groupid) {
                layer.confirm(`您确定要解散 ${groupid} 群聊吗？`, {
                    title: '提醒',
                    skin: 'chat-deleteconfirm delete-group',
                    id: 'DeleteGroup',
                    btn: ['确认解散', '取消'], //按钮
                    btnAlign: 'c',
                    shade: 0 //不显示遮罩
                }, function() {
                    // _TzRequestEvents.request({
                    //     url: '/api/DeleteGroupById',
                    //     type: 'POST',
                    //     data: {
                    //         GroupId: groupid
                    //     },
                    //     dataType: 'json',
                    // }).then(res => {
                    //     // console.log('Promise:');
                    //     // console.log(res);
                    //     layer.msg('解散成功', {
                    //         icon: 1
                    //     });
                    // }).catch(err => {
                    //     console.log(err);
                    // })
                    layer.msg('解散成功', {
                        icon: 1
                    });
                }, function() {
                    layer.msg('取消解散', {
                        icon: 2
                    });
                });
            },
            joinGroup: function(groupid) {

            },
            inviteJoinGroup: function(groupid) {
                let _this = this;
                layer.open({
                    type: 1,
                    skin: 'chatpanel-invitejoingroup',
                    id: 'ChatpanelInviteJoinGroup',
                    title: `邀请好友加入 ${groupid} 群聊`,
                    shadeClose: false,
                    shade: 0,
                    area: ['450px'],
                    resize: false,
                    zIndex: layer.zIndex,
                    content: `
                        <div class="chatpanel-invitejoingroup-container">
                            <div id="InviteJoinGroupTemplate">邀请好友加入群聊列表</div>
                            <div class="chatpanel-invitejoingroup-btn">
                                <button type="button" class="layui-btn invitejoingroup-btn" tz-event="getChecked">确认邀请</button>
                                <button type="button" class="layui-btn layui-btn-primary cancel-invitejoingroup-btn">关闭</button>
                            </div> 
                        </div>`,
                    success: function(layero) {
                        $(layero[0]).find('.cancel-invitejoingroup-btn').off('click').on('click', function() {
                            layer.close($(layero[0]).attr('times'));
                        });
                        $.ajax({
                            url: 'https://www.fastmock.site/mock/992387632827a42b26d0a126c2acdea5/ChatPages/api/InviteFriendsJoinGroup',
                            type: 'POST',
                            dataType: 'json',
                            success: function(res) {
                                // console.log(res)
                                tree.render({
                                    elem: '#InviteJoinGroupTemplate',
                                    id: 'InviteJoinGroupTree',
                                    data: res,
                                    // accordion: true,
                                    showLine: false, //是否开启连接线
                                    showCheckbox: true,
                                    click: function(obj) {
                                        console.log(obj)
                                        if (!obj.data.isGroup) {

                                            if (!_this.lock) {
                                                _this.lock = true;

                                                layer.msg(JSON.stringify(obj.data));
                                                //TODO：显示好友详细信息

                                                setTimeout(() => {
                                                    _this.lock = false;
                                                }, 1500);
                                            }
                                        }
                                    }
                                });
                                util.event('tz-event', {
                                    getChecked: function(othis) {
                                        if (!_this.lock) {
                                            _this.lock = true;
                                            let _checkedData = tree.getChecked('InviteJoinGroupTree'); //获取选中节点的数据
                                            let _InviteJoinGroupFriens = [];
                                            console.log(_checkedData);
                                            _checkedData.forEach((item, index) => {
                                                item.children.forEach((item2, index2) => {
                                                    console.log(item2)
                                                    _InviteJoinGroupFriens.push(item2);
                                                })
                                            })
                                            console.log(_InviteJoinGroupFriens);
                                            if (_InviteJoinGroupFriens.length <= 0) {
                                                layer.msg('没有选择任何好友!');
                                                _this.lock = false;
                                                return;
                                            }
                                            _TzRequestEvents.request({
                                                url: '/api/Todo',
                                                type: 'POST',
                                                dataType: 'json',
                                            }).then(res => {
                                                console.log(res);
                                                layer.msg('邀请好友加入群聊成功!');
                                                _this.lock = false;
                                                layer.close($(layero[0]).attr('times'));
                                            }).catch(err => {
                                                console.log(err);
                                            })
                                        }
                                    }
                                });
                            }
                        })

                    }
                });
            },
            outGroup: function(groupid) {
                layer.confirm(`您确定要退出 ${groupid} 群聊吗？`, {
                    skin: 'chat-deleteconfirm out-group',
                    id: 'OutGroup',
                    btn: ['确认退出', '取消'], //按钮
                    btnAlign: 'c',
                    shade: 0 //不显示遮罩
                }, function() {
                    layer.msg('退出成功', {
                        icon: 1
                    });
                }, function() {
                    layer.msg('取消退出', {
                        icon: 2
                    });
                });
            },
            moveOutGroup: function(userid, groupid) {
                layer.confirm(`您确定将 ${userid} 移出 ${groupid} 群聊吗？`, {
                    skin: 'chat-deleteconfirm moveout-group',
                    id: 'MoveOutGroup',
                    btn: ['确认移出', '取消'], //按钮
                    btnAlign: 'c',
                    shade: 0 //不显示遮罩
                }, function() {
                    layer.msg('移出成功', {
                        icon: 1
                    });
                }, function() {
                    layer.msg('取消移出', {
                        icon: 2
                    });
                });
            },
        };



    });

    window.TzChatPanel = TzChatPanel;
}());