import { GetterTree, ActionTree, MutationTree } from 'vuex';
import VuexPersistence from 'vuex-persist';

export const plugins = [new VuexPersistence().plugin];
export const state = () => ({
  families: [] as any[],
});

export type RootState = ReturnType<typeof state>;

export const getters: GetterTree<RootState, RootState> = {
  families: (state) => state.families,
  speciesAndTitle:
    (state): any =>
    (slug: string) => {
      let species: any = null;
      let title: string | null = null;
      state.families.forEach((family) => {
        let result = null;
        const subfamily = family.subfamilies.find((subfamily: any) => {
          if (subfamily.slug) {
            return subfamily.slug === slug;
          }
          subfamily.species.forEach((oneSpecies: Record<string, any>) => {
            if (oneSpecies.slug === slug) {
              result = oneSpecies;
            }
          });
        });
        if (subfamily) {
          species = subfamily.species;
          title = subfamily.title;
          return;
        }
        if (result) {
          species = [result];
          title = (result['Common name'] as Record<string, string>).text;
        }
      });
      return { species, title };
    },
};

export const mutations: MutationTree<RootState> = {
  mutateFamilies: (state, newFamilies: any[]) => (state.families = newFamilies),
};

export const actions: ActionTree<RootState, RootState> = {
  updateFamilies({ commit }, newFamilies) {
    commit('mutateFamilies', newFamilies);
  },
};
