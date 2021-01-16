<template>
  <div class="container">
    <div>
      <Logo />
      <h1 class="title">parrot-wiki</h1>
      <div v-if="!$fetchState.pending">
        <!-- <pre>{{ list }}</pre> -->
        <div v-for="(section, index) in data.sections" :key="index">
          <div v-if="section.title === ''">
            <div v-for="(paragraph, i) in section.paragraphs" :key="i">
              <div v-for="(sentence, j) in paragraph.sentences" :key="j">
                {{ sentence.text }}
              </div>
            </div>
          </div>
        </div>
        <div v-for="(family, index) in list" :key="index">
          <h1>{{ family.title }}</h1>
          <div v-for="(subfamily, i) in family.subfamilies" :key="i">
            <h2>{{ subfamily.title }}</h2>
            <div
              v-for="(tableList, j) in subfamily.tables"
              :key="j"
              class="columns is-centered is-multiline"
            >
              <div
                v-for="(species, k) in tableList"
                :key="k"
                class="column is-3"
              >
                <div class="card">
                  <div class="card-image">
                    <figure class="image is-square">
                      <img
                        :src="
                          species.Picture.text !== ''
                            ? `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${species.Picture.text}&width=300`
                            : require('~/assets/images/bird.png')
                        "
                        :alt="`${species['Common name'].text}`"
                      />
                    </figure>
                  </div>
                  <div class="content">
                    <h3>{{ species['Common name'].text }}</h3>
                    <p>{{ species['Scientific name'].text }}</p>
                  </div>
                </div>
              </div>
            </div>
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
  data: any;
  list: object | undefined;
}

export default Vue.extend({
  async fetch() {
    // this.data = await fetch(
    //   'http://en.wikipedia.org/w/api.php?origin=*&action=parse&format=json&prop=text&section=0&page=Budgerigar'
    // ).then((res) => res.json());
    const result = await wtf.fetch('List of parrots');
    this.data = result?.json();
    const families = this.data?.sections.filter(
      (section: { title?: string; depth?: number }) => section.depth === 1
    );
    families.forEach((family) => {
      family.subfamilies = [];
    });
    const indices: Number[] = [];
    for (let i = 0; i < this.data.sections.length; i++)
      if (this.data.sections[i].depth === 1) {
        indices.push(i);
      }
    this.data.sections.forEach((section: any, index: any) => {
      for (let j = 1; j < indices.length; j++) {
        if (index > indices[j - 1] && index < indices[j]) {
          families[j - 1].subfamilies.push(section);
        }
      }
    });
    this.list = families;
  },
  data(): Data {
    return {
      data: undefined,
      list: undefined,
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
