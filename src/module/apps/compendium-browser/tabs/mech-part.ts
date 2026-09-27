import { CompendiumBrowser } from "../browser.svelte.ts";
import { ContentTabName } from "../data.ts";
import { CompendiumBrowserTab } from "./base.svelte.ts";
import { CompendiumBrowserIndexData, MechPartFilters } from "./data.ts";

export class CompendiumBrowserMechPartTab extends CompendiumBrowserTab {
    tabName: ContentTabName = "mechPart";
    tabLabel = "PF2E.CompendiumBrowser.TabMechPart";
    declare filterData: MechPartFilters;

    /* MiniSearch */
    override searchFields = ["name", "originalName"];
    override storeFields = ["name", "originalName", "img", "uuid", "level", "rarity", "options"];

    constructor(browser: CompendiumBrowser) {
        super(browser);

        // Set the filterData object of this tab
        this.filterData = this.prepareFilterData();
    }

    protected override async loadData(): Promise<void> {
        console.debug(`${SYSTEM_NAME} System | Compendium Browser | Started loading Mech Parts`);

        const mechParts: CompendiumBrowserIndexData[] = [];
        const publications = new Set<string>();
        const indexFields = [
            "img",
            "system.actionType.value",
            "system.actions.value",
            "system.category",
            "system.level.value",
            "system.prerequisites.value",
            "system.traits",
            "system.publication",
            "system.source",
        ];

        for await (const { pack, index } of this.browser.packLoader.loadPacks(
            "Item",
            this.browser.loadedPacks("mechPart"),
            indexFields,
        )) {
            console.debug(
                `${SYSTEM_NAME} System | Compendium Browser | ${pack.metadata.label} - ${index.size} entries found`,
            );
            for (const mechPartdata of index) {
                console.log({mechPartdata})
                if (mechPartdata.type !== "mechPart") continue;

                const system = mechPartdata.system;

                const category = system.category;
                const type = mechPartdata.type;
                const traits: string[] = system.traits.value;
                const pubSource = system.publication?.title ?? system.source?.value ?? "";
                const options: string[] = [
                    ...traits.map((t: string) => `trait:${t.replace(/^hb_/, "")}`),
                    `category:${category}`,
                    `type:${type}`,
                    `level:${system.level.value}`,
                    `rarity:${system.traits.rarity}`,
                    this.preparePublicationSource(pubSource, publications),
                ];


                mechParts.push({
                    name: mechPartdata.name,
                    originalName: mechPartdata.originalName, // Added by Babele
                    img: mechPartdata.img,
                    uuid: mechPartdata.uuid,
                    level: mechPartdata.system.level.value,
                    rarity: mechPartdata.system.traits.rarity,
                    options: new Set(options),
                });
            }
        }

        // Set indexData
        this.indexData = mechParts;

        console.log({indexData: this.indexData})
        // Filters
        // WIP need to add type
        this.filterData.checkboxes.skills.options = this.generateCheckboxOptions(CONFIG.PF2E.skills);
        this.filterData.checkboxes.rarity.options = this.generateCheckboxOptions(CONFIG.PF2E.rarityTraits);
        this.filterData.source.options = this.generateSourceCheckboxOptions(publications);
        this.filterData.traits.options = this.generateMultiselectOptions(CONFIG.PF2E.mechTraits);

        console.debug(`${SYSTEM_NAME} System | Compendium Browser | Finished loading feats`);
    }

    protected override prepareFilterData(): MechPartFilters {
        return {
            checkboxes: {
                category: {
                    isExpanded: false,
                    label: "PF2E.CompendiumBrowser.Filter.Categories",
                    options: {},
                    selected: [],
                },
                skills: {
                    isExpanded: false,
                    label: "PF2E.SkillsLabel",
                    options: {},
                    optionPrefix: "skill",
                    selected: [],
                },
                rarity: {
                    isExpanded: false,
                    label: "PF2E.CompendiumBrowser.Filter.Rarities",
                    options: {},
                    selected: [],
                },
            },
            source: {
                isExpanded: false,
                label: "PF2E.CompendiumBrowser.Filter.Source",
                options: {},
                selected: [],
            },
            traits: {
                conjunction: "and",
                options: [],
                selected: [],
            },
            order: {
                by: "level",
                direction: "asc",
                options: {
                    name: { label: "PF2E.NameLabel", type: "alpha" },
                    level: { label: "PF2E.LevelLabel", type: "numeric" },
                },
                type: "numeric",
            },
            level: {
                changed: false,
                isExpanded: false,
                min: 0,
                max: 20,
                from: 0,
                to: 20,
            },
            search: {
                text: "",
            },
        };
    }
}
