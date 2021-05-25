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
                    <span
                      v-for="(displayData, l) in species['Common name'].dataForDisplay"
                      :key="l"
                    >
                      {{ displayData.text }}
                      <a :href="displayData.url">{{ displayData.link }}</a>
                    </span>
                    <span
                      v-for="(displayData, l) in species['Scientific name'].dataForDisplay"
                      :key="l"
                    >
                      {{ displayData.text }}
                      <a :href="displayData.url">{{ displayData.link }}</a>
                    </span>
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
  test: any;
  test2: any;
  test3: any;
}

interface Link {
  page?: string;
  site?: string;
  text: string;
  type: string;
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
    families.forEach((family: any) => {
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
    this.test = [
      {
        text: 'Something with a',
        link: 'link',
        url: 'http://www.google.com',
      },
      {
        text: ', which is followed by another',
        link: 'reference',
        url: 'http://www.facebook.com',
      },
      {
        text: null,
        link: 'where everything is a huge link',
        url: 'http://www.yandex.ru'
      },
      {
        text: 'and also some additional text with no link',
        link: null,
        url: null,
      },
    ];
    const test2 = [
      {
        title: 'Family Psittacidae',
        depth: 1,
        subfamilies: [
          {
            title: 'Subfamily Psittacinae',
            depth: 2,
            tables: [
              [
                {
                  'Common name': {
                    text: 'Grey parrot',
                    links: [
                      {
                        type: 'internal',
                        page: 'Grey parrot',
                      },
                    ],
                  },
                },
              ],
            ],
          },
        ],
      },
    ];

    this.list = this.recursivelyIterate(this.list);
    this.data.sections = this.recursivelyIterate(this.data.sections);
  },
  data(): Data {
    return {
      data: undefined,
      list: undefined,
      test: undefined,
      test2: undefined,
      test3: undefined,
    };
  },
  methods: {
    recursivelyIterate(array: any): any[] {
      array.forEach((object: any) => {
        Object.values(object).forEach((value: any) => {
          if (value.isArray) {
            this.recursivelyIterate(value);
          } else if (typeof value === 'object' && value !== null) {
            this.recursivelyIterateOverObject(value);
          }
        });
      });
      return array;
    },
    recursivelyIterateOverObject(object: any): void {
      const objectAsArray: [string, any][] = Object.entries(object);
      objectAsArray.forEach((entry: [string, any], index: number) => {
        const key: string = entry[0];
        const value: any = entry[1];
        if (key === 'text') {
          let textValue: any = value;
          object.dataForDisplay = [];
          if (
            objectAsArray[index + 1] &&
            objectAsArray[index + 1][0] === 'links'
          ) {
            const links: Link[] = objectAsArray[index + 1][1];
            links.forEach((link: Link, index: number) => {
              const linkWording: string = link.text || link.page;
              const slug: string = link.page?.split(' ').join('_');
              const nextLinkWording: string =
                links[index + 1]?.text || links[index + 1]?.page;
              if (textValue.includes(linkWording)) {
                if (textValue.indexOf(linkWording)) {
                  object.dataForDisplay.push({
                    text: textValue.substring(
                      0,
                      textValue.indexOf(linkWording)
                    ),
                    link: null,
                    url: null,
                  });
                }
                object.dataForDisplay.push({
                  text: null,
                  link: linkWording,
                  url:
                    link.type === 'internal'
                      ? `https://en.wikipedia.org/wiki/${slug}`
                      : link.site,
                });
                textValue = textValue.substring(
                  textValue.indexOf(linkWording) + linkWording.length
                );
                if (nextLinkWording) {
                  const text = textValue.substring(
                    0,
                    textValue.indexOf(nextLinkWording)
                  );
                  object.dataForDisplay.push({
                    text,
                    link: null,
                    url: null,
                  });
                  textValue = textValue.substring(
                    textValue.indexOf(text) + text.length
                  );
                } else if (textValue.length) {
                  object.dataForDisplay.push({
                    text: textValue,
                    link: null,
                    url: null,
                  });
                }
              }
            });
          } else {
            object.dataForDisplay.push({
              text: textValue,
              link: null,
              url: null,
            });
          }
        } else if (value?.isArray) {
          this.recursivelyIterate(value);
        } else if (typeof value === 'object' && value !== null) {
          this.recursivelyIterateOverObject(value);
        }
      });
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
