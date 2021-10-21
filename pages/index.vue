<template>
  <div class="container is-fullhd">
    <div class="section p-3">
      <div class="is-flex is-justify-content-center">
        <h1 class="title has-text-white has-background-black mb-0">
          parrot-wiki
        </h1>
      </div>
      <div v-if="!loading">
        <div class="section text p-0 has-text-justified">
          <div
            v-for="(paragraph, i) in data.sections[0].paragraphs"
            :key="i"
            class="mx-4 py-4"
            :class="i % 2 === 0 ? 'even' : 'odd'"
          >
            <p
              v-for="(sentence, j) in paragraph.sentences"
              :key="j"
              class="is-inline"
            >
              <span
                v-for="(displayData, l) in sentence.dataForDisplay"
                :key="l"
              >
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
      </div>
    </div>
    <div v-if="!loading" class="section p-5">
      <div class="columns table is-multiline mgt-0">
        <div
          v-for="(family, index) in families"
          :key="`family-${index}`"
          class="column is-half"
        >
          <a
            :href="`https://en.wikipedia.org/wiki/${family.title.replace(
              'Family ',
              ''
            )}`"
            target="_blank"
          >
            <v-popover trigger="hover" placement="top-end">
              <h1 class="tooltip-target" :class="getClass(index)">
                {{ family.title.replace('Family ', '') }}
                <span v-if="family.disclaimer" class="is-hidden-mobile">*</span>
              </h1>
              <small v-if="family.disclaimer" class="is-hidden-mobile">
                {{ family.disclaimer }}
              </small>
              <Popover
                slot="popover"
                :src="imageSrc(family.title)"
                :title="family.title.replace('Family ', '')"
              />
            </v-popover>
          </a>
          <client-only>
            <template v-for="(subfamily, i) in family.subfamilies">
              <nuxt-link
                v-if="subfamily.title"
                :key="`subfamily-${i}`"
                :to="subfamily.slug"
              >
                <h2 class="has-text-left">
                  {{ subfamily.title }}
                </h2>
              </nuxt-link>
              <template v-else>
                <nuxt-link
                  v-for="(species, j) in subfamily.species"
                  :key="`species-${j}`"
                  :to="species.slug"
                >
                  <h2 class="has-text-left">
                    {{ species['Common name'].text }}
                  </h2>
                </nuxt-link>
              </template>
            </template>
          </client-only>
        </div>
      </div>
      <small v-if="!loading">
        Beautiful logo by
        <a
          target="_blank"
          href="https://www.vecteezy.com/free-vector/free-vector-images-for-commercial-use"
        >
          Free Vector Images For Commercial Use Vectors by Vecteezy
        </a>
      </small>
      <small v-if="!loading" class="is-block">
        <a target="_blank" href="https://icons8.com/icon/52245/budgie">
          Budgie
        </a>
        icon by
        <a target="_blank" href="https://icons8.com">Icons8</a>
      </small>
    </div>
    <img v-if="loading" src="@/assets/images/loader.svg" />
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import wtf from 'wtf_wikipedia';
import Popover from '../components/Popover.vue';
import transform from '../mixins/transform';

interface Data {
  data: any;
  families: any[];
  loading: boolean;
}

export default (
  Vue as VueConstructor<Vue & InstanceType<typeof transform>>
).extend({
  components: {
    Popover,
  },
  mixins: [transform],
  async fetch() {
    this.loading = true;
    const result = await wtf.fetch('List of parrots');
    this.data = result?.json();
    this.families = this.data?.sections.filter(
      (section: { title?: string; depth?: number }) => section.depth === 1
    );
    this.families.forEach((family: any) => {
      family.subfamilies = [];
    });
    const indices: Number[] = [];
    for (let i = 0; i < this.data?.sections.length; i++)
      if (this.data?.sections[i].depth === 1) {
        indices.push(i);
      }
    this.data?.sections.forEach((section: any, index: any) => {
      for (let j = 1; j < indices.length; j++) {
        if (
          index > indices[j - 1] &&
          index < indices[j] &&
          section.depth === 2
        ) {
          this.families[j - 1].subfamilies.push(section);
        }
      }
    });
    this.families.forEach((family: any) => {
      if (family.subfamilies && !family.subfamilies.length) {
        family.disclaimer =
          'This family does not contain subfamilies thus species are listed below';
        family.subfamilies[0] = {
          title: null,
          species: [],
        };
      }
      family.subfamilies.forEach((subfamily: any) => {
        subfamily.species = [];
        subfamily.title = subfamily.title
          ? subfamily.title.replace('Subfamily ', '')
          : null;
        subfamily.slug = subfamily.title
          ? subfamily.title
              .replace(/\s\(.*\)/, '')
              .replace(/\s/g, '_')
              .replace(/s$/, '')
          : null;
        if (!subfamily.tables) {
          family.tables.forEach((table: any) => {
            table.forEach((species: any) => {
              subfamily.species.push(species);
            });
          });
          subfamily.species.forEach((oneSpecies: Record<string, any>) => {
            oneSpecies.slug = oneSpecies['Common name'].text
              .replace(/\s\(.*\)/, '')
              .replace(/\s/g, '_');
          });
        } else {
          subfamily.tables.forEach((tables: any) => {
            tables.forEach((table: any) => {
              subfamily.species.push(table);
            });
          });
        }
        Object.keys(subfamily).forEach((key) => {
          if (key !== 'species' && key !== 'title' && key !== 'slug') {
            delete subfamily[key];
          }
        });
      });
      Object.keys(family).forEach((key) => {
        if (key !== 'subfamilies' && key !== 'title' && key !== 'disclaimer') {
          delete family[key];
        }
      });
    });
    this.families = this.recursivelyIterate(this.families);
    this.data.sections = this.recursivelyIterate(this.data.sections);
    this.$store.commit('mutateFamilies', this.families);
    this.loading = false;
  },
  data(): Data {
    return {
      data: undefined,
      families: [],
      loading: false,
    };
  },
  methods: {
    getClass(index: number) {
      if (index === 0 || index === 3 || index === 4) {
        return 'red';
      }
      return 'black';
    },
    imageSrc(title: string): string | void {
      const family = this.families.find((family) => family.title === title);
      let randomImageSrc: string | undefined = undefined;
      if (!family.subfamilies.length) {
        return;
      }
      family.subfamilies.forEach((subfamily: any) => {
        if (!subfamily.species) {
          return;
        }
        const randomSpecies =
          subfamily.species[
            Math.floor(Math.random() * subfamily.species.length)
          ];
        if (!randomSpecies?.Picture?.text) {
          return;
        }
        randomImageSrc = `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${randomSpecies.Picture.text}&width=48`;
      });
      return randomImageSrc;
    },
  },
});
</script>

<style lang="scss">
@mixin popover-arrow {
  content: '';
  width: 0px;
  height: 0px;
  position: absolute;
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

.columns.table {
  background-color: #fee473;
  .column {
    border: 1px white solid;
    h1 {
      font-size: 5.4vw;
      overflow-wrap: break-word;
      font-weight: bold;
      line-height: 1;
      position: relative;
      &:hover {
        box-shadow: 0 -10px inset;
        transition: box-shadow 0.3s ease-in-out;
      }
      &.black {
        color: black;
      }
      &.red {
        color: red;
      }
    }
    a {
      font-size: 1rem;
      color: white;
      h2 {
        font-family: 'Work Sans', sans-serif;
        font-weight: 900;
        letter-spacing: 3px;
        font-size: 1.2rem;
        width: fit-content;
        &:hover {
          box-shadow: 0 -5px inset;
          transition: box-shadow 0.3s ease-in-out;
        }
      }
    }
    small {
      color: black;
      font-size: 0.7em;
      font-weight: bold;
    }
  }
}
.section.text {
  background-color: #fee473;
  margin-top: -10px;
  position: relative;
  &::before {
    @media only screen and (min-width: 812px) {
      content: '';
      width: 100%;
      height: 1px;
      background-color: #fee473;
      z-index: 1000;
      position: absolute;
      top: 0;
      left: 0;
    }
  }
  > div {
    width: 50%;
    position: relative;
    color: black;
    &:first-child {
      &::before {
        content: '';
        width: 25vw;
        height: 10%;
        background-color: black;
        background-size: cover;
        position: absolute;
        bottom: -20%;
        left: 20%;
        @media only screen and (max-width: 812px) {
          background-color: #fee473;
          bottom: 40%;
          left: 40%;
          width: 35vw;
          mix-blend-mode: multiply;
        }
      }
      &::after {
        content: '';
        width: 3vw;
        height: 30vh;
        background-color: red;
        background-size: cover;
        position: absolute;
        top: 20%;
        left: 110%;
        @media only screen and (max-width: 812px) {
          background-color: #fee473;
          left: 10%;
          top: 0;
          mix-blend-mode: multiply;
        }
      }
    }
    &:last-child {
      &::before {
        content: '';
        width: 15vw;
        height: 20%;
        background-color: red;
        background-size: cover;
        position: absolute;
        top: 0;
        left: 80%;
        mix-blend-mode: darken;
        @media only screen and (max-width: 812px) {
          mix-blend-mode: multiply;
          width: 5vw;
          height: 7vh;
          width: 40%;
          left: 15%;
          top: 55%;
        }
      }
      &::after {
        @media only screen and (max-width: 812px) {
          content: '';
          width: 3vw;
          height: 50vh;
          background-color: #fee473;
          background-size: cover;
          position: absolute;
          left: 60%;
          bottom: 55%;
          mix-blend-mode: multiply;
        }
      }
    }
    &.odd {
      width: 30%;
      margin-left: auto !important;
      padding-left: 1rem;
      padding-right: 1rem;
      &::before {
        content: '';
        height: 260px;
        width: 400px;
        background: url('~assets/images/logo.svg');
        background-size: cover;
        background-position: center;
        position: absolute;
        top: 0;
        left: calc(-400px - 10%);
        @media only screen and (max-width: 812px) {
          left: 80%;
          height: 10vh;
          width: 5vw;
          mix-blend-mode: multiply;
          background-image: none;
          background-color: red;
        }
      }
      &::after {
        content: '';
        width: 2vw;
        height: 80%;
        background-color: black;
        background-size: cover;
        position: absolute;
        top: 30%;
        left: -20%;
        @media only screen and (max-width: 812px) {
          left: 0;
          top: 25%;
          height: 5vh;
          width: 30%;
          background-color: #fee473;
          mix-blend-mode: multiply;
        }
      }
      background-color: black;
      a {
        border-bottom: dashed 1px white;
        color: white;
        &:hover {
          border-bottom: solid 1px;
        }
        @media only screen and (max-width: 812px) {
          color: black;
          border-bottom: dashed 1px black;
        }
      }
      p {
        color: white;
        @media only screen and (max-width: 812px) {
          color: black;
        }
      }
      @media only screen and (max-width: 812px) {
        width: auto;
        margin: 0 !important;
        background: none;
      }
    }
    @media only screen and (max-width: 812px) {
      width: auto;
    }
  }
  @media only screen and (max-width: 812px) {
    background: none;
  }
}
.container:not(.is-block) img.is-rounded {
  object-fit: contain;
  border-radius: 100% !important;
}
.popover[x-placement^='top-end']::after {
  @include popover-arrow();
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid white;
  border-bottom: 10px solid transparent;
  left: 50%;
  bottom: -20px;
}
.popover[x-placement^='bottom-end']::after {
  @include popover-arrow();
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid transparent;
  border-bottom: 10px solid white;
  left: 50%;
  top: -20px;
}
</style>
