<template>
  <div class="container" @click="clickHandle">
    <div>
      <!-- 时间组件 -->
      <i-time class="time" :initTime="initTime" :format="timeFormat">
      </i-time>
    </div>
    <div class="textUser">姓名：{{name}}，工号：{{num}}</div>
    <div class="textDing">○▁○上班：{{dingOn}}</div>
    <div class="textDing">♥▁♥下班：{{dingOff}}</div>

    <i-button type="primary" @click="ding">打卡</i-button>
    <i-button type="primary" @click="wxAuthUser">打开弹窗</i-button>
    
    <!-- 使用click-counter组件 -->
    <click-counter :init-num="10" @clicknum="handleClickNum">
      <!-- 填坑用 -->
      <input type="checkbox" />禁用
    </click-counter>
    <click-counter :init-num="20" @clicknum="handleClickNum" />
    <click-counter :init-num="30" @clicknum="handleClickNum" />
    <div>计数结果: {{count}}</div>
    <a href="/pages/test/main" class="navlink">进入计数器页面</a>

    <Button type="primary" @click="showConfirm = true">Display dialog box</Button>

    <!-- 弹窗授权用户信息 -->
    <i-modal :visible="showAuth" :showOk="false" :showCancel="false">
      <button type="primary" open-type="getUserInfo" @getuserinfo="wxGetUserInfo" @click="authCancel">微信登录</button>
    </i-modal>

    <!-- 弹窗完善个人信息 -->
    <i-modal
      :visible="showUser"
      title="完善个人信息"
      @ok="ok"
      @cancel="closeModal">
      <div>
        <i-input :value="name" @change="onNameChange" mode="wrapped" prefix="ios-contact" placeholder="输入姓名" style="width: auto" autocomplete="on" />
        <i-input :value="num" @change="onNumChange" mode="wrapped" prefix="ios-contact" placeholder="输入工号" style="width: auto" autocomplete="on" />
      </div>
    </i-modal>

    <!-- 弹窗打卡信息 -->
    <i-modal :visible="showDingOn" :showCancel="false" title="上班打卡" @ok="closeModal">
      <p>{{dingOn}}</p>
    </i-modal>
    <i-modal :visible="showDingOff" :showCancel="false" title="下班打卡" @ok="closeModal">
      <p>{{dingOff}}</p>
    </i-modal>
    <!-- 弹窗打卡二次确认 -->
    <i-modal :visible="showDingConfirm" title="确定下班打卡吗？" @ok="sendDingMsg" @cancel="closeModal">
    </i-modal>
    <i-modal :visible="showDong" :showCancel="false" title="请填写正确的姓名" @ok="closeDong">
    </i-modal>

    <i-message id="message" />
  </div>
</template>

<script>
// 导入click-counter组件
import ClickCounter from '@/components/click-counter'
import GlobalStore from '../../stores/global-store'
const {$Message} = require('../../../static/iview/base/index')

export default {
  // 声明在当前组件下使用click-counter组件
  components: { ClickCounter },

  created () {
    console.log('page index created!')
  },

  onShow () {
    this.wxLogin()
  },

  computed: {
    count () {
      return GlobalStore.state.count
    }
  },

  data () {
    return {
      msg: '今天您打卡了吗？',
      showAuth: false,
      showUser: false,
      showDingConfirm: false,
      showDingOn: false,
      showDingOff: false,
      showDong: false,
      name: '',
      num: '',
      dingOn: '',
      dingOff: '',
      initTime: 0,
      timeFormat: [ '年', '月', '日', ':', ':', ' ' ]
    }
  },

  methods: {
    clickHandle () {
      this.msg = '正在打卡......'
    },
    handleClickNum (data) {
      console.log('>>>>>>', data.num)
    },
    // 获取当前位置
    getLocations () {
      let _this = this
      wx.getSetting({
        success (res) {
          // debugger
          // 判断用户是否授权过
          // 未授权
          if (!res.authSetting['scope.userLocation']) {
            console.log('未授权!!!')
            wx.authorize({
              scope: 'scope.userLocation',
              success (res) {
                // 用户允许查看自己的位置
                console.log(res)
                _this.wxGetLocation()
              },
              fail (err) {
                console.log(err)
                // 当用户拒绝查看自己的位置的时候，统计数据
                // 统计数据，地理位置为空
                // _this.count();
              }
            })
          } else {
            // 已授权
            console.log('已授权...')
            _this.wxGetLocation()
          }
        }
      })
    },
    // 获取微信地理位置
    wxGetLocation () {
      let _this = this
      wx.getLocation({
        // type:'wgs84'
        success: function (res) {
          let latitude, longitude
          latitude = res.latitude.toString()
          longitude = res.longitude.toString()
          let msg = {
            cmd: '0',
            name: '张泽强'
          }
          console.log('经纬：', latitude, longitude)
          wx.request({
            header: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            url: 'https://myyiba.com:10009',
            method: 'POST',
            data: msg,
            success: function (res) {
              console.log('接收结果：', res.data.ret)
              _this.msg = '打卡成功'
            },
            fail: function (err) {
              console.log(err)
            }
          })
        },
        fail: function (err) {
          console.log(err)
          console.log(112)
        }
      })
    },
    // 微信登录获取code
    wxLogin () {
      let _this = this
      let APPID = 'wxbd8f4a305320e623'
      let SECRET = 'd9e3dfa81feff9833c5ff7536cb0e1b0'
      wx.login({
        success: function (res) {
          console.log('wxlogin code: ' + res.code)
          // 获取openid
          wx.request({
            url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + APPID + '&secret=' + SECRET + '&js_code=' + res.code + '&grant_type=authorization_code',
            method: 'GET',
            data: {},
            header: { 'content-type': 'application/json' },
            success: function (res) {
              console.log('wxlogin openid: ' + res.data.openid)
              // 设置openid
              GlobalStore.state.openid = res.data.openid
              // 向服务器请求欢迎信息
              let hiMsg = {
                cmd: '0',
                openid: GlobalStore.state.openid
              }
              wx.request({
                header: {
                  'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                },
                url: 'https://myyiba.com:10009',
                method: 'POST',
                data: hiMsg,
                success: function (res) {
                  let ret = res.data.ret
                  console.log('接收结果：', res.data.ret)
                  if (ret === 1) {
                    GlobalStore.state.name = res.data.name
                    GlobalStore.state.num = res.data.num
                    _this.name = res.data.name
                    _this.num = res.data.num
                    _this.dingOn = res.data.dingOn
                    _this.dingOff = res.data.dingOff
                    if (_this.initTime === 0) {
                      _this.initTime = res.data.time
                    }
                    $Message({
                      content: '你好，' + GlobalStore.state.name,
                      type: 'success'
                    })
                  } else {
                    // 完善个人信息
                    _this.showUser = true
                  }
                }
              })
            }
          })
        }
      })
    },
    // 获取微信用户信息
    wxGetUserInfo (e) {
      // let _this = this
      wx.getUserInfo({
        // 此处设为true，才会返回encryptedData等敏感信息
        withCredentials: true,
        success: res => {
          this.showAuth = false
          // 可以将 res 发送给后台解码出 unionId
          // app.globalData.userInfo = res.userInfo;
          // app.globalData.encryptedData = res.encryptedData;
          // app.globalData.iv = res.iv;
          // this.saveUserInfo();
          console.log('用户信息：', res)
          wx.login({
            success: function (res) {
              console.log(res)
            }
          })
        },
        // 弹窗获取用户信息授权
        fail: () => {
          console.log('弹出用户信息授权')
          this.showAuth = true
        }
      })
    },
    // 打卡
    ding () {
      const openid = GlobalStore.state.openid
      // 登录超时，重新登录
      if (!openid || openid.length === 0) {
        this.$Message.error('登录超时，请重新打开该页面！')
        return
      }
      // 下班二次确认
      if (this.dingOn.length > 0 && this.dingOff.length === 0) {
        this.showDingConfirm = true
      } else if (this.dingOn.length === 0) {
        // 上班
        this.sendDingMsg()
      }
    },
    // 打卡消息发送
    sendDingMsg () {
      let _this = this
      let dingMsg = {
        cmd: '1',
        openid: GlobalStore.state.openid
      }
      this.showDingConfirm = false
      wx.request({
        header: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        url: 'https://myyiba.com:10009',
        method: 'POST',
        data: dingMsg,
        success: function (res) {
          let ret = res.data.ret
          console.log('接收结果：', ret)
          if (ret === -1) {
            _this.$Message.error('登录超时，请重新打开该页面！')
            return
          }
          if (ret === -2) {
            _this.$Message.error('个人信息不完善，请重新打开该页面！')
            return
          }
          let dingType = res.data.dingType
          if (dingType === 1) {
            _this.dingOn = res.data.dingTime
            _this.showDingOn = true
          } else if (dingType === 2) {
            _this.dingOff = res.data.dingTime
            _this.showDingOff = true
          }
        }
      })
    },
    ok (e) {
      this.showUser = false
      let _this = this
      let userMsg = {
        cmd: '2',
        openid: GlobalStore.state.openid,
        name: _this.name,
        num: _this.num
      }
      // 完善个人信息
      wx.request({
        header: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        url: 'https://myyiba.com:10009',
        method: 'POST',
        data: userMsg,
        success: function (res) {
          let ret = res.data.ret
          console.log('接收结果：', res.data.ret)
          if (ret === 1) {
            GlobalStore.state.name = res.data.name
            GlobalStore.state.num = res.data.num
            _this.wxLogin()
            $Message({
              content: '个人信息更新成功',
              type: 'success'
            })
          } else {
            _this.name = ''
            _this.num = ''
            _this.showDong = true
          }
        }
      })
    },
    closeModal () {
      this.showUser = false
      this.showDingOn = false
      this.showDingOff = false
      this.showDingConfirm = false
    },
    closeDong () {
      this.showDong = false
      this.showUser = true
    },
    authOk () {
      this.showAuth = false
      wx.getSetting({
        success (res) {
          // debugger
          // 判断用户是否授权过
          // 未授权
          if (!res.authSetting['scope.userInfo']) {
            console.log('未授权!!!')
            wx.authorize({
              scope: 'scope.userInfo',
              success (res) {
                // 用户允许查看自己的位置
                console.log(res)
              },
              fail (err) {
                console.log(err)
              }
            })
          } else {
            // 已授权
            console.log('已授权...')
          }
        }
      })
    },
    // 拒绝授权
    authCancel () {
      this.showAuth = false
    },
    onNameChange (e) {
      console.log('name: ', e.target.detail.value)
      this.name = e.target.detail.value
    },
    onNumChange (e) {
      console.log('num: ', e.target.detail.value)
      this.num = e.target.detail.value
    }
  }
}
</script>

<style scoped>
.textUser {
  color: rgb(0, 68, 255);
  padding: 10px;
  text-align: center;
}
.textDing {
  color: red;
  padding: 10px;
  text-align: center;
}
.time {
  color: rgb(119, 0, 255);
  padding: 10px;
  text-align: center;
}
.navlink {
  text-decoration: underline;
}
</style>
