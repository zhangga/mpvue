<template>
  <div class="container-btns">
    <button class="calbtn" @click="handleDecrement">-</button>
    <span class="calnum">{{count}}</span>
    <button class="calbtn" @click="handleIncrement">+</button>
  </div>
</template>

<script>
import GlobalState from '../../stores/global-store'

export default {
  computed: {
    count () {
      return GlobalState.state.count
    }
  },
  methods: {
    handleDecrement () {
      GlobalState.commit('decrement')
    },
    handleIncrement () {
      GlobalState.commit('increment')
    }
  }
}
</script>

<style scoped>
.btns {
  display: flex;
  align-items: center;
}
.calnum {
  color: red;
  font-size: 32px;
}
</style>

