<template>
  <div class="container">
    <div>
      <Logo />
      <h1 class="title">parrot-wiki</h1>
      <div v-html="data.parse.text['*']" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
interface Data {
  data: Record<string, any>;
}

export default Vue.extend({
  async fetch() {
    this.data = await fetch(
      'http://en.wikipedia.org/w/api.php?origin=*&action=parse&format=json&prop=text&section=0&page=Budgerigar'
    ).then((res) => res.json());
    // this.data = response.text;
  },
  data(): Data {
    return {
      data: {},
    };
  },
  computed: {
    article(): number {
      return this.data.parse.text;
    },
  },
});
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
