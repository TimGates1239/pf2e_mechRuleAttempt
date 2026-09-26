import {
    activateActionSheetListeners,
} from "@item/ability/helpers.ts";
import { ItemSheetDataPF2e, ItemSheetOptions, ItemSheetPF2e } from "@item/base/sheet/sheet.ts";
import { OneToFour } from "@module/data.ts";
import { getItemFromDragEvent } from "@module/sheet/helpers.ts";
import {
    ErrorPF2e,
    htmlClosest,
    htmlQuery,
    htmlQueryAll,
} from "@util";
import * as R from "remeda";
import { MechPartPF2e } from "./document.ts";

class MechPartSheetPF2e extends ItemSheetPF2e<MechPartPF2e> {
    static override get defaultOptions(): ItemSheetOptions {
        return {
            ...super.defaultOptions,
            dragDrop: [{ dropSelector: ".tab[data-tab=details]" }],
            hasSidebar: true,
        };
    }

    override get validTraits(): Record<string, string> {
        return CONFIG.PF2E.mechTraits;
    }

    override async getData(options?: Partial<ItemSheetOptions>): Promise<MechPartSheetData> {
        const sheetData = await super.getData(options);

        return {
            ...sheetData,
            itemType: "Mech Part",
            actionsNumber: CONFIG.PF2E.actionsNumber,
            actionTypes: CONFIG.PF2E.actionTypes,
            acuityOptions: CONFIG.PF2E.senseAcuities,
            attributes: CONFIG.PF2E.abilities,
            categories: CONFIG.PF2E.featCategories,
            hasProficiencies: false,
            proficiencies: this.#getProficiencyOptions(),
            proficiencyRankOptions: Object.fromEntries(
                Object.values(CONFIG.PF2E.proficiencyRanks).map((label, i) => [`${i}`, label]),
            ),
        };
    }

    #getProficiencyOptions(): ProficiencyOptions {
        return {
            other: {
                group: null,
                options: [],
            },
            saves: {
                group: "Save Title",
                options: R.entries(CONFIG.PF2E.saves)
                    .map(([slug, label]) => ({
                        slug,
                        label: _loc(label),
                        rank: null,
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label)),
            },
            attacks: {
                group: "Attack Title",
                options: R.entries(CONFIG.PF2E.weaponCategories)
                    .map(([slug, categoryLabel]) => {
                        return {
                            slug,
                            label: categoryLabel,
                            rank: null,
                        };
                    })
                    .sort((a, b) => a.label.localeCompare(b.label)),
            },
            defenses: {
                group: "Defense Title",
                options: R.entries(CONFIG.PF2E.armorCategories)
                    .map(([slug, categoryLabel]) => {
                        return {
                            slug,
                            label: categoryLabel,
                            rank: null,
                        };
                    })
                    .sort((a, b) => a.label.localeCompare(b.label)),
            },
            classes: {
                group: "Class",
                options: R.entries(CONFIG.PF2E.classTraits)
                    .map(([slug, label]) => ({
                        slug,
                        label: _loc(label),
                        attribute: null,
                        rank:  null,
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label)),
            },
        };
    }

    /* -------------------------------------------- */
    /*  Event Listeners and Handlers                */
    /* -------------------------------------------- */

    override activateListeners($html: JQuery<HTMLElement>): void {
        super.activateListeners($html);
        const html = $html[0];
        const feat = this.item;
        activateActionSheetListeners(feat, html);

        // Disable the "add subfeature" anchor unless a corresponding option is selected
        const unselectedOptionsSelects = htmlQueryAll<HTMLSelectElement>(html, "select[data-unselected-options]");
        for (const unselectedOptionsSelect of unselectedOptionsSelects) {
            unselectedOptionsSelect.addEventListener("change", (event) => {
                event.stopPropagation();
                const addOptionAnchor = htmlQuery(htmlClosest(unselectedOptionsSelect, "li"), "a[data-action]");
                addOptionAnchor?.toggleAttribute("disabled", !unselectedOptionsSelect.value);
            });
        }

        this.#activateProficienciesListeners(html);
    }

    #activateProficienciesListeners(html: HTMLElement): void {
        const formGroup = htmlQuery(html, ".form-group[data-proficiencies]");
        formGroup?.addEventListener("click", (event) => {
            const anchor = htmlClosest(event.target, "a[data-action]");
            if (!anchor) return;
            if (anchor.dataset.action === "add-proficiency") {
               
            } else if (anchor.dataset.action === "delete-proficiency") {
               
            }
        });
    }

    override async _onDrop(event: DragEvent): Promise<void> {
        if (!this.isEditable) return;

        const item = await getItemFromDragEvent(event);
        if (!item) return;

        throw ErrorPF2e("Invalid item drop");
    }
}

interface MechPartSheetData extends ItemSheetDataPF2e<MechPartPF2e> {
    actionsNumber: typeof CONFIG.PF2E.actionsNumber;
    actionTypes: typeof CONFIG.PF2E.actionTypes;
    acuityOptions: typeof CONFIG.PF2E.senseAcuities;
    attributes: typeof CONFIG.PF2E.abilities;
    categories: typeof CONFIG.PF2E.featCategories;
    hasProficiencies: boolean;
    proficiencies: ProficiencyOptions;
    proficiencyRankOptions: Record<string, string>;
}

interface ProficiencyOptions {
    other: ProficiencyOptionGroup<null>;
    saves: ProficiencyOptionGroup;
    attacks: ProficiencyOptionGroup;
    defenses: ProficiencyOptionGroup;
    classes: ProficiencyOptionGroup;
}

interface ProficiencyOptionGroup<TGroup extends string | null = string> {
    group: TGroup;
    options: { slug: string; label: string; rank: OneToFour | null; invalid?: boolean }[];
}

export { MechPartSheetPF2e };
