layui.use(['element', 'layer', 'jquery', 'form'], function() {
    var element = layui.element,
        form = layui.form,
        layer = layui.layer,
        $ = layui.jquery;

    //监听折叠
    element.on('collapse(test)', function(data) {
        layer.msg('展开状态：' + data.show);
    });


    /** 好友面板底部功能 */
    var _funcOpen = '';
    $('.panel-foot-func-btn').off('click').on('click', function() {
        var _funcId = $(this).data('funcid');
        console.log(_funcId);
        if (_funcOpen !== _funcId) {
            _funcOpen = _funcId;
            switch (_funcId) {
                case "menu":
                    {
                        console.log('打开功能菜单');

                    }
                    break;
                case "setting":
                    {
                        console.log('打开设置弹窗');
                        layer.open({
                            type: 1,
                            anim: 2,
                            shade: 0,
                            title: '设置',
                            content: `
                                <div class="chat-settings">
                                    <form class="layui-form" action=""  lay-filter="PanelSettingForm">
                                        <div class="layui-form-item">
                                            <label class="layui-form-label">列表手风琴</label>
                                            <div class="layui-input-block">
                                                <input type="checkbox" checked="" name="SwitchAccordion" lay-skin="switch" lay-filter="switchAccordion" lay-text="开启|关闭">
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            `,
                            end: function() {
                                _funcOpen = '';
                            }
                        });
                        console.log(chatSetting.get())
                        //给表单赋值
                        form.val("PanelSettingForm", {
                            "SwitchAccordion": chatSetting.get().listAccordion
                        });
                        form.render();
                        //监听指定开关
                        form.on('switch(switchAccordion)', function(data) {
                            chatSetting.set({
                                listAccordion: this.checked
                            })
                            layer.msg('保存成功！');
                        });
                    }
                    break;
                case "addfriend":
                    {
                        console.log('打开添加好友弹窗');
                    }
                    break;
                case "msgbox":
                    {
                        console.log('打开消息盒子弹窗');
                    }
                    break;
                case "skins":
                    {
                        console.log('打开更换皮肤设置');
                        layer.open({
                            type: 1,
                            anim: 2,
                            shade: 0,
                            title: '设置皮肤',
                            content: _dataSource.GetSkinsTemplate(),
                            end: function() {
                                _funcOpen = '';
                            }
                        });
                        _bindEvents.bindSelectSkin();
                    }
                    break;
            }
        }
    });

    /** 数据源 */
    const _dataSource = {
        /** 获取皮肤数据源 */
        GetSkins: function() {

        },
        /** 获取皮肤模板 */
        GetSkinsTemplate: function() {
            var _skinTemplate = `
                  <ul class="chat-panel-set-skins">
                        <li class="select-skin select-skin-default" data-url="">
                            <a href="javascript:">
                                默认
                            </a>
                        </li> `;
            for (var i = 1; i <= 10; i++) {
                var _index = i < 10 ? '0' + i : i;
                _skinTemplate += `
                <li class="select-skin" data-url="images/skins/skin_0${_index}.png">
                    <a href="javascript:">
                        <img src="images/skins/skin_0${_index}.png" alt="">
                    </a>
                </li>`;
            }
            _skinTemplate += `
                    <li class="upload-skin" id="UploadSkin" title="上传皮肤">
                        <a href="javascript:">
                            <i class="layui-icon layui-icon-add-1"></i>
                        </a>
                    </li>
                </ul> `;
            return _skinTemplate;
        }
    };


    /** 绑定的事件 */
    const _bindEvents = {
        /** 绑定好友列表双击 */
        bindShowMessage: function() {
            $('.chat-panel-user-item').off('dblclick').on('dblclick', function() {
                console.log($(this).data('userid'));
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
            var _select = '';
            $('.select-skin').off('click').on('click', function() {
                var _skinUrl = $(this).data('url');
                if (_select !== _skinUrl) {
                    _select = _skinUrl;
                    $(this).addClass('active').siblings().removeClass('active');
                    // console.log('选择系统默认皮肤' + _skinUrl);
                    chatSetting.set({
                        skin: _skinUrl
                    });
                }

            });
            $('.upload-skin').off('click').on('click', function() {
                console.log('自定义皮肤上传');
            });
        }
    }

    /** 定义好友列表相关 */
    const chatPanel = {

        GetFriends: function() {
            var _friendGroups = [{
                groupname: '我的好友',
                count: 2,
                list: [{

                }]
            }, {
                groupname: '我的同学',
                count: 2,
                list: [{

                }]
            }, {
                groupname: '我的老师',
                count: 3,
                list: [{

                }]
            }];

            var _template = '';
            var _index = 0; //临时头像索引
            _friendGroups.forEach(function(item, index) {
                var _userItemTemplate = '';
                // item.list.forEach(function(litem, lindex) {  //真实数据
                for (var l = 0; l < item.count; l++) { //模拟数据
                    _index += 1;
                    _userItemTemplate += `
                        <div class="chat-panel-user-item" data-userid="${_index}" title="用户${_index}的昵称">
                            <div class="panel-user-left">
                                <img class="avatar" src="images/avatar/avatar_00${_index}.png" alt="">
                            </div>
                            <div class="panel-user-right">
                                <h3>用户${_index}的备注(<span>用户${_index}的昵称</span> )</h3>
                                <p>这是用户${_index}的个性签名啦啦啦啦啦啦啦啦</p>
                            </div>
                        </div> 
                    `;
                }
                // });
                _template += `
                    <div class="layui-colla-item">
                        <h2 class="layui-colla-title">${item.groupname.trim()}<span class="chat-user-friend-count">(2/${item.count})</span></h2>
                        <div class="layui-colla-content chat-panel-user-list">
                            ${_userItemTemplate}
                        </div>
                    </div> 
                `;
            })
            $('#UserFriendsList').html(_template);
            element.render();
            // _bindEvents.bindFriendsGroup();
            _bindEvents.bindShowMessage();
        },
        GetGroups: function() {

        },
        GetMsgList: function() {

        },
        init: function() {
            var _this = this;
            var _chatPanelInitTimer = setTimeout(function() {
                clearTimeout(_chatPanelInitTimer);
                _this.GetFriends();
                // _this.GetGroups();
                // _this.GetMsgList();
            }, 0);
        }
    }

    chatPanel.init();
});
