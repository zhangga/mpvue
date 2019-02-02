<template>
  <div class="container" @click="clickHandle">
    <div class="message">{{msg}}</div>
    <!-- 使用click-counter组件 -->
    <click-counter :init-num="10" @clicknum="handleClickNum">
      <!-- 填坑用 -->
      <input type="checkbox" />禁用
    </click-counter>
    <click-counter :init-num="20" @clicknum="handleClickNum" />
    <click-counter :init-num="30" @clicknum="handleClickNum" />
    <div>计数结果: {{count}}</div>
    <a href="/pages/test/main" class="navlink">进入计数器页面</a>
    <i-button type="primary" @click="bindViewTap">这是一个按钮</i-button>
  </div>
</template>

<script>
// 导入click-counter组件
import ClickCounter from '@/components/click-counter'
import GlobalStore from '../../stores/global-store'

export default {
  // 声明在当前组件下使用click-counter组件
  components: { ClickCounter },

  computed: {
    count () {
      return GlobalStore.state.count
    }
  },

  data () {
    return {
      msg: 'Hello World'
    }
  },

  methods: {
    clickHandle () {
      this.msg = 'clicked!!!!!!!!!'
    },
    handleClickNum (data) {
      console.log('>>>>>>', data.num)
    }
  }
}
</script>

<style scoped>
.message {
  color: red;
  padding: 10px;
  text-align: center;
}
.navlink {
  text-decoration: underline;
}
</style>
