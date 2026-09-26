import type { ActorPF2e, MechPF2e } from "@actor";
import type { DatabaseCreateCallbackOptions, DatabaseDeleteCallbackOptions, DatabaseUpdateCallbackOptions } from "@common/abstract/_types.d.mts";
import { ItemPF2e } from "@item";
import { RuleElement, RuleElementOptions } from "@module/rules/index.ts";
import { ErrorPF2e } from "@util";
import { MechPartSource, MechPartSystemData } from "./data.ts";
import { MechPartTrait } from "./types.ts";

class MechPartPF2e<TParent extends ActorPF2e | null = ActorPF2e | null> extends ItemPF2e<TParent> {
    static override get validTraits(): Record<MechPartTrait, string> {
        return CONFIG.PF2E.mechTraits;
    }

    get hp(): { value: number } {
        return {
            value: this.system.hp.value,
        };
    }

    get traits(): Set<MechPartTrait> {
        return new Set(this.system.traits.value);
    }

    override prepareBaseData(): void {
        super.prepareBaseData();

        this.hp.value = 0;
    }

    override prepareSiblingData(): void {
        if (!this.actor) return;
    }

    // item/class/document.ts uses this to set the system.attributes.classhp
    // what if I use this to pull the hp from item, it would need to be part of an array has multiple
    // mech parts increase the hp and multple hp increase
    // Something to look at if I remove the item will the hp stay? Or do I need to manually remove it?
    override prepareActorData(this: MechPartPF2e<MechPF2e>): void {
        const actor = this.actor;
        if (!actor?.isOfType("mech")) throw ErrorPF2e("Mech Part much be embedded in Mech-type actors");
        
    }

    // Maybe this is where I could remove it?
    override _onDelete(options: DatabaseDeleteCallbackOptions, userId: string): void {
        super._onDelete(options, userId)
    }

    /** Overriden to not create rule elements when suppressed */
    override prepareRuleElements(options?: Omit<RuleElementOptions, "parent">): RuleElement[] {
        return super.prepareRuleElements(options);
    }

    // override async getChatData(
    //     this: MechPartPF2e<ActorPF2e>,
    //     htmlOptions: EnrichmentOptionsPF2e = {},
    // ): Promise<RawItemChatData> {
    //     const actor = this.actor;
    //     const classSlug = actor.isOfType("character") && actor.class?.slug;
    //     // Exclude non-matching class traits
    //     const traitSlugs =
    //         ["class", "classfeature"].includes(this.category) &&
    //         actor.isOfType("character") &&
    //         classSlug &&
    //         this.system.traits.value.includes(classSlug)
    //             ? this.system.traits.value.filter((t) => t === classSlug || !(t in CONFIG.PF2E.classTraits))
    //             : this.system.traits.value;
    //     const traits = this.traitChatData(CONFIG.PF2E.featTraits, traitSlugs);
    //     const levelLabel = this.isFeat && this.level > 0 ? _loc("PF2E.Item.Feat.LevelN", { level: this.level }) : null;
    //     const rarity =
    //         this.rarity === "common"
    //             ? null
    //             : {
    //                   slug: this.rarity,
    //                   label: CONFIG.PF2E.rarityTraits[this.rarity],
    //                   description: CONFIG.PF2E.traitsDescriptions[this.rarity],
    //     //           };

    //     return this.processChatData(htmlOptions, {
    //         ...this.system,
    //         levelLabel,
    //         traits,
    //         rarity,
    //     });
    // }

    /* -------------------------------------------- */
    /*  Event Listeners and Handlers                */
    /* -------------------------------------------- */

    /** In case this was copied from an actor, clear the location if there's no parent. */
    protected override async _preCreate(
        data: DeepPartial<this["_source"]>,
        options: DatabaseCreateCallbackOptions,
        user: fd.BaseUser,
    ): Promise<boolean | void> {
        if (!this.parent) {
          
        }
        return super._preCreate(data, options, user);
    }

    protected override async _preUpdate(
        changed: DeepPartial<this["_source"]>,
        options: DatabaseUpdateCallbackOptions,
        user: fd.BaseUser,
    ): Promise<boolean | void> {
        if (!changed.system) return super._preUpdate(changed, options, user);

        // Ensure an empty-string `location` property is null
        if ("location" in changed.system) {
            changed.system.location ||= null;
        }

        // Normalize action data
        // normalizeActionChangeData(this, changed);

        return super._preUpdate(changed, options, user);
    }
}

interface MechPartPF2e<TParent extends ActorPF2e | null = ActorPF2e | null> extends ItemPF2e<TParent> {
    readonly _source: MechPartSource;
    system: MechPartSystemData;

    /** Interface alignment with other "attack items" */
    readonly range?: never;
}

export { MechPartPF2e };
