import * as R from "remeda";
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

    #creatureTraits = CONFIG.PF2E.creatureTraits;

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
                console.log(mechPartdata)
                if (mechPartdata.type !== "feat") continue;
                // Check separately for one of "system.category or "system.featType.value" to provide backward
                // compatible support for unmigrated feats in non-system compendiums.
                const categoryPaths = ["system.category", "system.featType.value"];
                const nonCategoryPaths = indexFields.filter((f) => !categoryPaths.includes(f));
                const categoryPathFound = categoryPaths.some((p) => fu.hasProperty(mechPartdata, p));

                if (!this.hasAllIndexFields(mechPartdata, nonCategoryPaths) || !categoryPathFound) {
                    console.warn(
                        `Feat "${mechPartdata.name}" does not have all required data fields.`,
                        `Consider unselecting pack "${pack.metadata.label}" in the compendium browser settings.`,
                    );
                    continue;
                }
                const system = mechPartdata.system;

                // Accommodate deprecated featType objects
                const featType: unknown = system.featType;
                if (R.isPlainObject(featType) && "value" in featType && typeof featType.value === "string") {
                    system.category = featType.value;
                    delete system.featType;
                }

                // Prerequisites are strings that could contain translated skill names
                const prereqs: { value: string }[] = system.prerequisites.value;
                const prerequisitesArr = prereqs.map((prerequisite) =>
                    prerequisite?.value ? prerequisite.value.toLowerCase() : "",
                );
                const skills: Set<string> = new Set();
                for (const prereq of prerequisitesArr) {
                    for (const [key, value] of Object.entries(CONFIG.PF2E.skills)) {
                        // Check the string for the english translation key or a translated skill name
                        const translated = _loc(value.label).toLocaleLowerCase(game.i18n.lang);
                        if (prereq.includes(key) || prereq.includes(translated)) {
                            // Alawys record the translation key to enable filtering
                            skills.add(key);
                        }
                    }
                }
                const category = system.category;
                const type = mechPartdata.type;
                const traits: string[] = system.traits.value;
                const pubSource = system.publication?.title ?? system.source?.value ?? "";
                const options: string[] = [
                    ...traits.map((t: string) => `trait:${t.replace(/^hb_/, "")}`),
                    ...skills.map((s) => `skill:${s}`),
                    `category:${category}`,
                    `type:${type}`,
                    `level:${system.level.value}`,
                    `rarity:${system.traits.rarity}`,
                    this.preparePublicationSource(pubSource, publications),
                ];

                // Tag ancestry items without an ancestry trait
                if (category === "ancestry" && !traits.some((t) => t in this.#creatureTraits)) {
                    options.push("trait:ancestry:universal");
                }

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

        // Filters
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
