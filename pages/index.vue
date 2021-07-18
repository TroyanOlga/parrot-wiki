<template>
  <div class="container is-fullhd">
    <div class="section p-3">
      <div class="is-flex is-justify-content-center">
        <h1 class="title has-text-white has-background-black mb-0">
          parrot-wiki
        </h1>
      </div>
      <div v-if="!$fetchState.pending">
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
    <div v-if="!$fetchState.pending" class="section">
      <div class="columns table is-multiline mgt-0">
        <div
          v-for="(family, index) in families"
          :key="`family-${index}`"
          class="column is-half"
        >
          <v-popover trigger="hover" placement="top-end">
            <h1 class="tooltip-target" :class="getClass(index)">
              {{ family.title.replace('Family ', '') }}
              <span v-if="family.species">*</span>
            </h1>
            <small v-if="family.species">
              This family does not contain subfamilies thus species are listed below
            </small>
            <Popover
              slot="popover"
              :src="imageSrc(family.title)"
              :title="family.title.replace('Family ', '')"
            />
          </v-popover>
          <template v-if="family.subfamilies.length">
            <nuxt-link
              v-for="(subfamily, i) in family.subfamilies"
              :key="`subfamily-${i}`"
              :to="{
                name: 'slug',
                params: {
                  species: subfamily.species,
                  slug: subfamily.title
                    .replace('Subfamily ', '')
                    .replace(/\s\(.*\)/, '')
                    .replace(/\s/g, '_')
                    .replace(/s$/, ''),
                },
              }"
            >
              <h2 class="has-text-left">
                {{ subfamily.title.replace('Subfamily ', '') }}
              </h2>
            </nuxt-link>
          </template>
          <template v-else>
            <nuxt-link
              v-for="(species, i) in family.species"
              :key="`species-${i}`"
              :to="{
                name: 'slug',
                params: {
                  species: species,
                  slug: species['Common name'].text
                    .replace(/\s\(.*\)/, '')
                    .replace(/\s/g, '_'),
                },
              }"
            >
              <h2 class="has-text-left">
                {{ species['Common name'].text }}
              </h2>
            </nuxt-link>
          </template>
        </div>
      </div>
    </div>
    <p>
      Beautiful logo by
      <a
        href="https://www.vecteezy.com/free-vector/free-vector-images-for-commercial-use"
      >
        Free Vector Images For Commercial Use Vectors by Vecteezy
      </a>
    </p>
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
}

export default (Vue as VueConstructor<
  Vue & InstanceType<typeof transform>
>).extend({
  components: {
    Popover,
  },
  mixins: [transform],
  async fetch() {
    // this.data = await fetch(
    //   'http://en.wikipedia.org/w/api.php?origin=*&action=parse&format=json&prop=text&section=0&page=Budgerigar'
    // ).then((res) => res.json());
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
        family.species = [];
        family.tables.forEach((table: any) => {
          table.forEach((species: any) => {
            family.species.push(species);
          });
        });
      }
      family.subfamilies.forEach((subfamily: any) => {
        subfamily.species = [];
        subfamily.tables.forEach((tables: any) => {
          tables.forEach((table: any) => {
            subfamily.species.push(table);
          });
        });
      });
    });
    this.families = this.recursivelyIterate(this.families);
    this.data.sections = this.recursivelyIterate(this.data.sections);
  },
  data(): Data {
    return {
      data: undefined,
      families: [],
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
      if (family.subfamilies.length) {
        family.subfamilies.forEach((subfamily: any) => {
          if (!subfamily.tables) {
            return;
          }
          subfamily.tables.forEach((table: any) => {
            const randomSpecies =
              table[Math.floor(Math.random() * table.length)];
            if (!randomSpecies.Picture.text) {
              return;
            }
            randomImageSrc = `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${randomSpecies.Picture.text}&width=48`;
          });
        });
      } else if (family.tables.length) {
        family.tables.forEach((table: any) => {
          const randomSpecies = table[Math.floor(Math.random() * table.length)];
          if (!randomSpecies.Picture.text) {
            return;
          }
          randomImageSrc = `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${randomSpecies.Picture.text}&width=48`;
        });
      }
      return randomImageSrc;
    },
  },
});
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;900&display=swap');
body {
  font-family: 'Work Sans', sans-serif;
  font-weight: 400;
  line-height: 1.25;
}
a {
  color: inherit;
  border-bottom: dashed 1px black;
  &:hover {
    border-bottom: solid 1px;
  }
}
.container {
  margin: 0 auto;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  text-align: center;
}

h1.title {
  font-family: 'Work Sans', sans-serif;
  display: block;
  font-weight: 900;
  font-size: 100px;
  letter-spacing: 1px;
  z-index: 1;
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
      font-size: 5.7vw;
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
  }
}
.section.text {
  background-color: #fee473;
  margin-top: -10px;
  position: relative;
  &::before {
    content: '';
    width: 100%;
    height: 1px;
    background-color: #fee473;
    z-index: 1000;
    position: absolute;
    top: 0;
    left: 0;
  }
  > div {
    width: 50%;
    position: relative;
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
        top: -20%;
        left: 80%;
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
      }
      background-color: black;
      a {
        border-bottom: dashed 1px white;
        color: white;
        &:hover {
          border-bottom: solid 1px;
        }
      }
      p {
        color: white;
      }
    }
  }
}
.container:not(.is-block) img.is-rounded {
  object-fit: contain;
  border-radius: 100% !important;
}
</style>
