<template>
  <div class="container">
    <div>
      <Logo />
      <h1 class="title">parrot-wiki</h1>
      <div v-if="!$fetchState.pending">
        <div v-for="(section, index) in data.sections" :key="index">
          <div v-if="section.title === ''">
            <div v-for="(paragraph, i) in section.paragraphs" :key="i">
              <div v-for="(sentence, j) in paragraph.sentences" :key="j">
                {{ sentence.text }}
              </div>
            </div>
          </div>
        </div>
        <div v-for="(section, index) in data.sections" :key="index">
          <div v-if="section.title === 'True parrots'">
            <h1>{{ section.title }}</h1>
          </div>
          <div v-if="section.title === 'Family Psittacidae'">
            <h2>{{ section.title }}</h2>
          </div>
          <div v-if="section.title === 'Subfamily Psittacinae'">
            <h3>{{ section.title }}</h3>
            <div
              v-for="(tableList, i) in section.tables"
              :key="i"
              class="columns is-centered is-multiline"
            >
              <div v-for="(table, j) in tableList" :key="j" class="column is-3">
                <div class="card">
                  <div class="card-image">
                    <figure class="image is-square">
                      <img
                        :src="
                          table.Picture.text !== ''
                            ? `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${table.Picture.text}&width=300`
                            : require('~/assets/images/bird.png')
                        "
                        :alt="`${table['Common name'].text}`"
                      />
                    </figure>
                  </div>
                  <div class="content">
                    <h3>{{ table['Common name'].text }}</h3>
                    <p>{{ table['Scientific name'].text }}</p>
                  </div>
                </div>
              </div>
            </div>
            <!-- <pre>{{ section }}</pre> -->
          </div>
          <div
            v-if="section.title === 'Subfamily Arinae (neotropical parrots)'"
          >
            <h3>{{ section.title }}</h3>
            <div
              v-for="(tableList, i) in section.tables"
              :key="i"
              class="columns is-centered is-multiline"
            >
              <div v-for="(table, j) in tableList" :key="j" class="column is-3">
                <div class="card">
                  <div class="card-image">
                    <figure class="image is-square">
                      <img
                        :src="
                          table.Picture.text !== ''
                            ? `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${table.Picture.text}&width=300`
                            : require('~/assets/images/bird.png')
                        "
                        :alt="`${table['Common name'].text}`"
                      />
                    </figure>
                  </div>
                  <div class="content">
                    <h3>{{ table['Common name'].text }}</h3>
                    <p>{{ table['Scientific name'].text }}</p>
                  </div>
                </div>
              </div>
            </div>
            <!-- <pre>{{ section }}</pre> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import wtf from 'wtf_wikipedia';

interface Data {
  data: object | undefined;
}

export default Vue.extend({
  async fetch() {
    // this.data = await fetch(
    //   'http://en.wikipedia.org/w/api.php?origin=*&action=parse&format=json&prop=text&section=0&page=Budgerigar'
    // ).then((res) => res.json());
    const result = await wtf.fetch('List of parrots');
    this.data = result?.json();
  },
  data(): Data {
    return {
      data: undefined,
    };
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
