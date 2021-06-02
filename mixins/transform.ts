import Vue from 'vue';

interface Link {
  page?: string;
  site?: string;
  text: string;
  type: string;
}

export default Vue.extend({
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
    recursivelyIterateOverObject(object: any): Record<any, any> {
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
              const linkWording: string | undefined = link.text || link.page;
              const slug: string | undefined = link.page?.split(' ').join('_');
              const nextLinkWording: string | undefined =
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
                  textValue.indexOf(linkWording) +
                    (linkWording as string).length
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
      return object;
    },
  },
});
