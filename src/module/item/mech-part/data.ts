import { ItemSystemModel, ItemSystemSchema } from "@item/base/data/model.ts";
import type {
    BaseItemSourcePF2e,
    ItemSystemSource,
    ItemTraitsNoRarity,
} from "@item/base/data/system.ts";
import type { MechPartPF2e } from "./document.ts";
import type { MechPartTrait } from "./types.ts";
import fields = foundry.data.fields;
import { LaxArrayField, SlugField } from "@system/schema-data-fields.ts";

// WIP taken from Feat item folders

type MechPartSource = BaseItemSourcePF2e<"mechPart", MechPartSystemSource>;

class MechPartSystemData extends ItemSystemModel<MechPartPF2e, MechPartSystemSchema> {
    declare traits: MechPartTraits;

    static override defineSchema(): MechPartSystemSchema {
        const featTraits: Record<MechPartTrait, string> = CONFIG.PF2E.mechTraits;

        // WIP seems to match the system object fields
        return {
            ...super.defineSchema(),
            hp: new fields.SchemaField({
                value: new fields.NumberField({
                    required: true,
                    nullable: false,
                    integer: true,
                    min: 1,
                    initial: 1
                })
            }),
            traits: new fields.SchemaField({
                otherTags: new fields.ArrayField(
                    new SlugField({ required: true, nullable: false, initial: undefined }),
                ),
                value: new LaxArrayField(
                    new fields.StringField({
                        required: true,
                        nullable: false,
                        choices: featTraits,
                        initial: undefined,
                    }),
                )
            }),
            level: new fields.SchemaField({
                value: new fields.NumberField({
                    required: true,
                    nullable: false,
                    integer: true,
                    min: 1,
                    max: 30,
                    initial: 1,
                }),
                taken: new fields.NumberField({
                    required: false,
                    nullable: true,
                    integer: true,
                    min: 1,
                    max: 30,
                    initial: undefined,
                }),
            }),
        };
    }

    override prepareBaseData(): void {
        super.prepareBaseData();
        // `Infinity` is stored as `null` in JSON, so change back
        this.hp = { value: 0 };
        this.traits
    }

    override prepareDerivedData(): void {
        
    }
}

interface MechPartSystemData
    extends
        ItemSystemModel<MechPartPF2e, MechPartSystemSchema>,
        Omit<fields.ModelPropsFromSchema<MechPartSystemSchema>, "description"> {}

type MechPartSystemSchema = Omit<ItemSystemSchema, "traits"> & {
    hp: fields.SchemaField<{
        value: fields.NumberField<number, number, true, false, true>;
    }>;
    traits: fields.SchemaField<{
            value: fields.ArrayField<fields.StringField<MechPartTrait, MechPartTrait, true, false, false>>;
            otherTags: fields.ArrayField<SlugField<true, false, false>, string[], string[], true, false, true>;
        }>;

    // Unused, but needed to build: 
    level: fields.SchemaField<{
            value: fields.NumberField<number, number, true, false, true>;
            taken: fields.NumberField<number, number, false, true, false>;
        }>;
};

interface MechPartTraits extends ItemTraitsNoRarity<MechPartTrait> {}

type MechPartSystemSource = fields.SourceFromSchema<MechPartSystemSchema> & {
    schema?: ItemSystemSource["schema"];
};


export { MechPartSystemData };
export type { MechPartSource, MechPartSystemSource };
