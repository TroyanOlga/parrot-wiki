<template v-if="src">
  <div class="popup-container">
    <figure class="image is-48x48">
      <img :src="src" alt="" class="is-rounded" />
    </figure>
    <div v-if="!$fetchState.pending" class="popup-wording">
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
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import wtf from 'wtf_wikipedia';
import transform from '../mixins/transform';

export default (
  Vue as VueConstructor<Vue & InstanceType<typeof transform>>
).extend({
  mixins: [transform],
  props: {
    src: { type: String, required: true },
    title: { type: String, required: true },
  },
  async fetch() {
    const result = (await wtf.fetch(this.title))?.json();
    const firstSection = (result as any)?.sections[0];
    this.firstSection =
      this.recursivelyIterateOverObject(firstSection).paragraphs;
    if (this.firstSection.length > 1) {
      this.firstSection.length = 1;
    }
    this.firstSection.forEach((paragraph: any) => {
      if (paragraph.sentences.length > 2) {
        paragraph.sentences.length = 2;
      }
    });
  },
  data() {
    return {
      firstSection: undefined as any,
    };
  },
});
</script>
<style lang="scss" scoped>
.popup-container {
  background-color: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  figure {
    display: inline-block;
    img {
      height: 100%;
    }
  }
  .popup-wording {
    > div {
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      flex-direction: column;
      justify-content: center;
      align-content: space-around;
    }
    max-width: 25vw;
    font-size: 0.7rem;
    margin: 0 0.5rem;
  }

}
</style>
