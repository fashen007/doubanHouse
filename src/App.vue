<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <houseList></houseList>
  </div>
</template>

<script>
import houseList from './components/houseList.vue'

export default {
  name: 'app',
  components: {
    houseList
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
