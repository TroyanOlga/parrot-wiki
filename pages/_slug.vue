<template>
  <div class="container is-fullhd is-block">
    <h1
      class="
        title
        slug-title
        has-text-white has-background-black
        mx-auto
        mb-0
        mt-2
      "
    >
      {{ title }}
    </h1>
    <template v-if="!loading">
      <div class="section main-text has-text-justified">
        <div v-for="(paragraph, i) in firstSection" :key="i">
          <p
            v-for="(sentence, j) in paragraph.sentences"
            :key="j"
            class="is-inline"
          >
            <span v-for="(displayData, l) in sentence.dataForDisplay" :key="l">
              {{ displayData.text }}
              <a
                v-if="displayData.link"
                :href="displayData.url"
                target="_blank"
              >
                {{ displayData.link }}
              </a>
            </span>
          </p>
        </div>
      </div>
      <client-only>
        <div class="section p-lg-3 is-relative">
          <div
            v-if="species && species.length"
            class="columns is-multiline is-justify-content-space-around"
          >
            <div
              v-for="(oneSpecies, index) in species"
              :key="index"
              class="column is-full mb-5"
            >
              <template
                v-if="oneSpecies.Picture && oneSpecies.Picture.text !== ''"
              >
                <h3 :ref="`missingImageText-${index}`" class="is-hidden">
                  No picture available :(
                </h3>
                <img
                  :src="`https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${oneSpecies.Picture.text}&width=500`"
                  class="is-hidden-mobile"
                  @error="(event) => getDefaultImg(event, index)"
                />
                <img
                  :src="`https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${oneSpecies.Picture.text}&width=300`"
                  class="is-hidden-tablet"
                  @error="(event) => getDefaultImg(event, index)"
                />
              </template>
              <template v-else>
                <h3>No picture available :(</h3>
                <img
                  src="@/assets/images/logo.svg"
                  alt=""
                  class="fallback-img"
                />
              </template>
              <p>
                {{ oneSpecies['Common name'].text }}
              </p>
              <small>{{ oneSpecies['Scientific name'].text }}</small>
            </div>
          </div>
        </div>
      </client-only>
      <nuxt-link class="button is-black is-hidden-tablet" to="/">
        <span class="icon m-0">
          <font-awesome-icon class="fa-lg" :icon="['fas', 'home']" />
        </span>
      </nuxt-link>
      <nuxt-link class="button is-black is-hidden-mobile" to="/">
        <span class="icon">
          <font-awesome-icon :icon="['fas', 'home']" />
          <i class="fas fa-chevron-left"></i>
        </span>
        <span>Home</span>
      </nuxt-link>
    </template>
    <img v-if="loading" src="@/assets/images/loader.svg" />
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import wtf from 'wtf_wikipedia';
import transform from '../mixins/transform';

interface Computed {
  speciesAndTitle: {
    species: any[];
    title: string;
  };
  species: any[];
  title: string;
}

interface Mixins {
  [index: number]: any;
}

interface Data {
  firstSection: any;
  loading: boolean;
}

interface Methods {
  getDefaultImg: (event: Event, index: number) => void;
}

interface Refs {
  [index: number]: Element;
}

export default (
  Vue as VueConstructor<Vue & InstanceType<typeof transform>>
).extend<Data, Methods, Computed, Mixins>({
  mixins: [transform],
  async fetch() {
    this.loading = true;
    const { slug } = this.$route.params;
    const result = (await wtf.fetch(slug))?.json();
    let firstSection = (result as any)?.sections[0];
    firstSection = this.recursivelyIterateOverObject(firstSection).paragraphs;
    const lastParagpraph = firstSection[firstSection.length - 1].sentences;
    const lastSentence = lastParagpraph[lastParagpraph.length - 1];
    const lastPart =
      lastSentence.dataForDisplay[lastSentence.dataForDisplay.length - 1].text;
    if (lastPart.endsWith(':')) {
      firstSection[firstSection.length - 1].sentences[
        firstSection[firstSection.length - 1].sentences.length - 1
      ].dataForDisplay[
        firstSection[firstSection.length - 1].sentences[
          firstSection[firstSection.length - 1].sentences.length - 1
        ].dataForDisplay.length - 1
      ].text = lastPart.replace(/:$/, '.');
    }
    this.firstSection = firstSection;
    this.loading = false;
  },
  data(): Data {
    return {
      firstSection: undefined as any,
      loading: false,
    };
  },
  computed: {
    speciesAndTitle() {
      const { slug } = this.$route.params;
      return this.$store.getters.speciesAndTitle(slug);
    },
    species() {
      return this.speciesAndTitle.species;
    },
    title() {
      return this.speciesAndTitle.title;
    },
  },
  methods: {
    getDefaultImg(event: Event, index: number): void {
      const imageUrl = require('@/assets/images/logo.svg');
      (event.target! as HTMLImageElement).src = imageUrl;
      (event.target! as HTMLImageElement).classList.add('fallback-img');
      if ((this.$refs[`missingImageText-${index}`] as Refs)[0]) {
        (
          (this.$refs[`missingImageText-${index}`] as Refs)[0] as HTMLElement
        ).classList.remove('is-hidden');
      }
    },
  },
});
</script>
<style lang="scss" scoped>
h1.title.slug-title {
  width: fit-content;
  font-size: 5em;
  @media only screen and (max-width: 812px) {
    background-color: black !important;
    color: white !important;
    font-size: 47px;
  }
}
.container {
  @media only screen and (max-width: 812px) {
    width: 100vw !important;
  }
  > * {
    max-width: 100vw;
  }
}
.section {
  &.main-text {
    position: relative;
    padding: 1rem 1.5rem 0 1.5rem;
    &::before {
      content: '';
      width: 3vw;
      height: 25vh;
      background-color: #fee473;
      background-size: cover;
      position: absolute;
      top: -20%;
      left: 20%;
      z-index: -1;
    }
    &::after {
      content: '';
      width: 25vw;
      height: 5vh;
      background-color: #fee473;
      background-size: cover;
      position: absolute;
      top: 20%;
      left: 70%;
      z-index: -1;
    }
  }
  &:not(.main-text) {
    padding-bottom: 0;
  }
}
.column {
  position: relative;
  background-color: #fee473;
  padding: 0 20% 0 20%;
  background-clip: content-box;
  height: 100vh;
  > p {
    position: absolute;
    right: 15%;
    top: 35%;
    background-color: white;
    font-weight: bold;
    color: black;
    min-width: 100px;
    padding: 3vh 1vh 3vh 1vh;
    max-width: 60%;
    @media only screen and (max-width: 812px) {
      top: 10%;
      right: 7%;
    }
  }
  > small {
    position: absolute;
    left: 15%;
    top: 60%;
    background-color: white;
    color: black;
    font-weight: bold;
    padding: 1vh 0.5vh 1vh 0.5vh;
    max-width: 60%;
    @media only screen and (max-width: 812px) {
      top: unset;
      bottom: 10%;
      left: 7%;
    }
  }
  img {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    max-height: 100%;
    &.fallback-img {
      max-height: 100px;
    }
  }
  h3 {
    vertical-align: middle;
    line-height: 80vh;
    color: black;
    font-weight: 600;
    @media only screen and (max-height: 667px) {
      line-height: 75vh;
    }
    @media only screen and (min-height: 1023px) {
      line-height: 85vh;
    }
  }
}
.button {
  position: fixed;
  top: 5%;
  right: 20px;
  font-family: 'Work Sans', sans-serif;
  font-weight: bold;
  @media only screen and (max-width: 812px) {
    top: unset;
    bottom: 5px;
    right: 8px;
  }
}
</style>
