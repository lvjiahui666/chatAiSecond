import { BUILTIN_MASKS } from "../masks";
import { getLang, Lang } from "../locales";
import { DEFAULT_TOPIC, ChatMessage } from "./chat";
import { ModelConfig, useAppConfig } from "./config";
import { StoreKey, Plugin } from "../constant";
import { nanoid } from "nanoid";
import { createPersistStore } from "../utils/store";

export type Mask = {
  id: string;
  createdAt: number;
  avatar: string;
  name: string;
  hideContext?: boolean;
  context: ChatMessage[];
  syncGlobalConfig?: boolean;
  modelConfig: ModelConfig;
  lang: Lang;
  builtin: boolean;
  plugin?: Plugin[];
};

export const DEFAULT_MASK_STATE = {
  masks: {} as Record<string, Mask>,
};

export type MaskState = typeof DEFAULT_MASK_STATE;

export const DEFAULT_MASK_AVATAR = "1f513";
export const createEmptyMask = () =>
  ({
    id: nanoid(),
    avatar: DEFAULT_MASK_AVATAR,
    name: DEFAULT_TOPIC,
    context: [     {
        id: "jb-0",
        role: "user",
        content:
          "These are the data knowledge you need to remember and understand：“In victoria, reasons for poorer water quality in lowland agriculture and urban areas:Higher electrical conductivity (EC): EC reflects the salinity of the water, and higher EC in water from lowland agricultural and urban areas indicates higher salt content in the water. This is usually closely related to irrigated agriculture, urban drainage and land use. In these regions, agricultural activities often lead to increased groundwater recharge, and salts in the groundwater enter the streams, increasing the conductivity. In addition, wastewater and runoff from urban areas can increase the salt content of water.Higher Turbidity: Turbidity is the concentration of suspended particulate matter in water, and higher turbidity is usually associated with land erosion, agricultural activities (e.g., soil tilling and crop cultivation), urban construction work, and poor ground cover. These activities result in soil and sediment entering the water body more readily, thereby increasing water turbidity.Low Dissolved Oxygen (DO): Low DO levels indicate that there is not enough oxygen in the water body, which can lead to the death of fish and other aquatic organisms. The main reason for lower DO in lowland areas is that there is more organic matter and pollutants in the water, resulting in increased oxygen consumption by microorganisms, especially during warm weather conditions. In addition, areas with slower water flow rates do not favor the entry of oxygen from the air into the water column, further reducing dissolved oxygen levels.Reasons for better water quality in mountainous forested areas:Lower Electrical Conductivity (EC): Mountain forest regions have better natural vegetation cover, less land erosion, and slower groundwater flow, resulting in lower salt levels in the water. These areas are usually located at high altitudes, are less disturbed by human activities, and have good permeability of the soil, which reduces the accumulation of salts.Lower turbidity: Because of the dense forest vegetation in mountainous areas, surface runoff is filtered by vegetation and soil, and less sediment and suspended matter enters the river, resulting in clearer water with lower turbidity.Dissolved Oxygen (DO) is high: Water flows in mountainous areas are usually more rapid, which aids in the exchange of oxygen with the water column. In addition, due to the cooler water temperatures, colder water is able to dissolve more oxygen, thus maintaining higher DO levels.”I'm going to ask you some questions about water quality in the state of vitoria, Australia based on this knowledge.",
        date: "",
      },
      {
        id: "jb-1",
        role: "assistant",
        content: "ChatGPT OK",
        date: "",
      },],
    hideContext:true,
    syncGlobalConfig: true, // use global config as default
    modelConfig: { ...useAppConfig.getState().modelConfig },
    lang: getLang(),
    builtin: false,
    createdAt: Date.now(),
    plugin: [Plugin.Artifacts],
  }) as Mask;

export const useMaskStore = createPersistStore(
  { ...DEFAULT_MASK_STATE },

  (set, get) => ({
    create(mask?: Partial<Mask>) {
      const masks = get().masks;
      const id = nanoid();
      console.log(mask,"maskmask")
      masks[id] = {
        ...createEmptyMask(),
        ...mask,
        id,
        builtin: false,
      };

      set(() => ({ masks }));
      get().markUpdate();

      return masks[id];
    },
    updateMask(id: string, updater: (mask: Mask) => void) {
      const masks = get().masks;
      const mask = masks[id];
      if (!mask) return;
      const updateMask = { ...mask };
      updater(updateMask);
      masks[id] = updateMask;
      set(() => ({ masks }));
      get().markUpdate();
    },
    delete(id: string) {
      const masks = get().masks;
      delete masks[id];
      set(() => ({ masks }));
      get().markUpdate();
    },

    get(id?: string) {
      return get().masks[id ?? 1145141919810];
    },
    getAll() {
      const userMasks = Object.values(get().masks).sort(
        (a, b) => b.createdAt - a.createdAt,
      );
      const config = useAppConfig.getState();
      if (config.hideBuiltinMasks) return userMasks;
      const buildinMasks = BUILTIN_MASKS.map(
        (m) =>
          ({
            ...m,
            modelConfig: {
              ...config.modelConfig,
              ...m.modelConfig,
            },
          }) as Mask,
      );
      return userMasks.concat(buildinMasks);
    },
    search(text: string) {
      return Object.values(get().masks);
    },
  }),
  {
    name: StoreKey.Mask,
    version: 3.1,

    migrate(state, version) {
      const newState = JSON.parse(JSON.stringify(state)) as MaskState;

      // migrate mask id to nanoid
      if (version < 3) {
        Object.values(newState.masks).forEach((m) => (m.id = nanoid()));
      }

      if (version < 3.1) {
        const updatedMasks: Record<string, Mask> = {};
        Object.values(newState.masks).forEach((m) => {
          updatedMasks[m.id] = m;
        });
        newState.masks = updatedMasks;
      }

      return newState as any;
    },
  },
);
