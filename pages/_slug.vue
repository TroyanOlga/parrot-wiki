<template>
  <div v-if="!$fetchState.pending" class="container is-fullhd is-block">
    <div class="section">
      <div v-for="(paragraph, i) in firstSection" :key="i">
        <p
          v-for="(sentence, j) in paragraph.sentences"
          :key="j"
          class="is-inline"
        >
          <span v-for="(displayData, l) in sentence.dataForDisplay" :key="l">
            {{ displayData.text }}
            <a v-if="displayData.link" :href="displayData.url" target="_blank">
              {{ displayData.link }}
            </a>
          </span>
        </p>
      </div>
    </div>
    <div v-if="species.length" class="columns is-multiline">
      <div v-for="(oneSpecies, index) in species" :key="index" class="column">
        <img
          v-if="oneSpecies.Picture && oneSpecies.Picture.text"
          :src="`https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${oneSpecies.Picture.text}&width=300`"
        />
        <p>{{ oneSpecies['Common name'].text }}</p>
        <small>{{ oneSpecies['Scientific name'].text }}</small>
      </div>
    </div>
    <div v-else class="section">
      <img
        v-if="species.Picture && species.Picture.text"
        :src="`https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${species.Picture.text}&width=300`"
      />
      <p>{{ species['Common name'].text }}</p>
      <small>{{ species['Scientific name'].text }}</small>
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import wtf from 'wtf_wikipedia';
import transform from '../mixins/transform';

export default (Vue as VueConstructor<
  Vue & InstanceType<typeof transform>
>).extend({
  mixins: [transform],
  async fetch() {
    const { slug, species } = this.$route.params;
    const result = (await wtf.fetch(slug))?.json();
    const firstSection = (result as any)?.sections[0];
    this.firstSection = this.recursivelyIterateOverObject(
      firstSection
    ).paragraphs;
    if (species) {
      this.species = species;
    }
  },
  data() {
    return {
      firstSection: undefined as any,
      species: undefined as any,
    };
  },
});
</script>
