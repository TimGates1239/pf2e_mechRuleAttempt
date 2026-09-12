import type { ActorAttributes, ActorDetails, ActorHitPoints, BaseActorSourcePF2e } from "@actor/data/base.ts";
import type { Resistance, Weakness } from "@actor/data/iwr.ts";
import { Immunity } from "@actor/data/iwr.ts";
import { ActorHitPointsSchema, ActorSystemModel, ActorSystemSchema } from "@actor/data/model.ts";
import { ActorSizePF2e } from "@actor/data/size.ts";
import type { ActorAlliance, ImmunityType, ResistanceType, WeaknessType } from "@actor/types.ts";
import type { Rarity, Size } from "@module/data.ts";
import { PublicationField, RarityField } from "@module/model.ts";
import { DataUnionField, LaxArrayField } from "@system/schema-data-fields.ts";
import type { ArmorClassTraceData } from "@system/statistic/armor-class.ts";
import type { MechPF2e } from "./document.ts";
import type { MechTrait } from "./types.ts";
import fields = foundry.data.fields;

/** The stored source data of a mech actor */
type MechSource = BaseActorSourcePF2e<"mech", MechSystemSource>;

class MechSystemData extends ActorSystemModel<MechPF2e, MechSystemSchema> {
    declare attributes: MechAttributes;

    declare alliance: ActorAlliance;

    static override defineSchema(): MechSystemSchema {
        // WIP do we needed?
        const mechTraits: Record<MechTrait, string> = CONFIG.PF2E.vehicleTraits;
        const sizes: Record<Size, string> = CONFIG.PF2E.actorSizes;
        const requiredInteger = ({ min, initial = min }: { min: number; initial?: number }) =>
            new fields.NumberField<number, number, true, false, boolean>({
                required: true,
                nullable: false,
                integer: true,
                min,
                initial,
            });
        const blankableString = () =>
            new fields.StringField({ required: true, nullable: false, blank: true, initial: "" });
        const spaceDimension = () =>
            new fields.NumberField<number, number, true, false, true>({
                required: true,
                nullable: false,
                integer: true,
                min: 5,
                step: 5,
                max: 300,
                initial: 5,
            });
        const immunityTypes: Record<ImmunityType, string> = CONFIG.PF2E.immunityTypes;
        const weaknessTypes: Record<WeaknessType, string> = CONFIG.PF2E.weaknessTypes;
        const resistanceTypes: Record<ResistanceType, string> = CONFIG.PF2E.resistanceTypes;

        return {
            ...super.defineSchema(),
            traits: new fields.SchemaField({
                value: new LaxArrayField(
                    new fields.StringField({
                        required: true,
                        nullable: false,
                        choices: mechTraits,
                        initial: undefined,
                    }),
                ),
                rarity: new RarityField(),
                size: new fields.SchemaField({
                    value: new fields.StringField({ required: true, nullable: false, choices: sizes, initial: "lg" }),
                }),
            }),
            attributes: new fields.SchemaField<
                MechAttributesSchema,
                fields.SourceFromSchema<MechAttributesSchema>,
                MechAttributes
            >({
                hp: new fields.SchemaField({
                    value: requiredInteger({ min: 0 }),
                    max: requiredInteger({ min: 0 }),
                    temp: requiredInteger({ min: 0 }),
                    details: blankableString(),
                }),
                ac: new fields.SchemaField({
                    value: requiredInteger({ min: -Infinity, initial: 0 }),
                }),
                hardness: requiredInteger({ min: 0 }),
                collisionDC: new fields.SchemaField({
                    value: requiredInteger({ min: -Infinity, initial: 0 }),
                }),
                collisionDamage: new fields.SchemaField({
                    value: blankableString(),
                }),
                immunities: new LaxArrayField(
                    new fields.SchemaField({
                        type: new fields.StringField({
                            required: true,
                            nullable: false,
                            choices: immunityTypes,
                            initial: undefined,
                        }),
                        exceptions: new LaxArrayField(
                            new fields.StringField({
                                required: true,
                                nullable: false,
                                choices: immunityTypes,
                                initial: undefined,
                            }),
                        ),
                    }),
                ),
                weaknesses: new LaxArrayField(
                    new fields.SchemaField({
                        type: new fields.StringField({
                            required: true,
                            nullable: false,
                            choices: weaknessTypes,
                            initial: undefined,
                        }),
                        value: requiredInteger({ min: 1 }),
                        exceptions: new LaxArrayField(
                            new fields.StringField({
                                required: true,
                                nullable: false,
                                choices: weaknessTypes,
                                initial: undefined,
                            }),
                        ),
                    }),
                ),
                resistances: new LaxArrayField(
                    new fields.SchemaField({
                        type: new fields.StringField({
                            required: true,
                            nullable: false,
                            choices: resistanceTypes,
                            initial: undefined,
                        }),
                        value: requiredInteger({ min: 1 }),
                        exceptions: new LaxArrayField(
                            new fields.StringField({
                                required: true,
                                nullable: false,
                                choices: resistanceTypes,
                                initial: undefined,
                            }),
                        ),
                        doubleVs: new LaxArrayField(
                            new fields.StringField({
                                required: true,
                                nullable: false,
                                choices: resistanceTypes,
                                initial: undefined,
                            }),
                        ),
                    }),
                ),
                emitsSound: new DataUnionField(
                    [
                        new fields.StringField<"encounter", "encounter", true, false, false>({
                            required: true,
                            nullable: false,
                            choices: ["encounter"] as const,
                            initial: undefined,
                        }),
                        new fields.BooleanField<boolean, boolean, true, false, false>({
                            required: true,
                            nullable: false,
                            initial: undefined,
                        }),
                    ],
                    { required: true, nullable: false, initial: "encounter" },
                ),
            }),
            details: new fields.SchemaField({
                description: new fields.HTMLField({ required: true, nullable: false, initial: "" }),
                level: new fields.SchemaField({
                    value: requiredInteger({ min: -1, initial: 0 }),
                }),
                price: requiredInteger({ min: 0 }),
                space: new fields.SchemaField({
                    long: spaceDimension(),
                    wide: spaceDimension(),
                    high: spaceDimension(),
                }),
                crew: blankableString(),
                passengers: blankableString(),
                pilotingCheck: blankableString(),
                AC: requiredInteger({ min: 0 }),
                speed: blankableString(),
                publication: new PublicationField(),
            }),
            saves: new fields.SchemaField({
                fortitude: new fields.SchemaField({
                    value: requiredInteger({ min: -Infinity, initial: 0 }),
                }),
            }),
        };
    }

    override prepareBaseData(): void {
        super.prepareBaseData();
        this.details.alliance = null;

        // Set the dimensions of this mech in its size object
        const size = this.traits.size;
        const dimensions = this.parent.dimensions;
        size.long = dimensions.length;
        size.wide = dimensions.width;

        if (!this.attributes.immunities.some((i) => i.type === "object-immunities")) {
            this.attributes.immunities.push(new Immunity({ type: "object-immunities", source: "TYPES.Actor.mech" }));
        }

        // Attempt to parse out a meaningful drive speed
        const driveSpeed = Math.floor(Number.parseInt(this.details.speed)) || null;
        this.movement = { speeds: { drive: { value: driveSpeed } } };
    }
}

interface MechMovementData {
    speeds: { drive: { value: number | null } };
}

interface MechSystemData
    extends ActorSystemModel<MechPF2e, MechSystemSchema>, fields.ModelPropsFromSchema<MechSystemSchema> {
    traits: MechTraits;
    attributes: MechAttributes;
    details: MechDetails;
    movement: MechMovementData;
}

type MechSystemSchema = ActorSystemSchema & {
    traits: fields.SchemaField<MechTraitsSchema>;
    attributes: fields.SchemaField<
        MechAttributesSchema,
        fields.SourceFromSchema<MechAttributesSchema>,
        MechAttributes
    >;
    details: fields.SchemaField<MechDetailsSchema>;
    saves: fields.SchemaField<{
        fortitude: fields.SchemaField<{
            value: fields.NumberField<number, number, true, false, true>;
        }>;
    }>;
};

type MechTraitsSchema = {
    value: fields.ArrayField<fields.StringField<MechTrait, MechTrait, true, false, false>>;
    rarity: fields.StringField<Rarity, Rarity, true, false, true>;
    size: fields.SchemaField<{
        value: fields.StringField<Size, Size, true, false, true>;
    }>;
};

interface MechTraits extends fields.ModelPropsFromSchema<MechTraitsSchema> {
    size: ActorSizePF2e;
}

type MechAttributesSchema = {
    hp: fields.SchemaField<ActorHitPointsSchema, fields.SourceFromSchema<ActorHitPointsSchema>, MechHitPoints>;
    ac: fields.SchemaField<{
        value: fields.NumberField<number, number, true, false, true>;
    }>;
    hardness: fields.NumberField<number, number, true, false, true>;
    collisionDC: fields.SchemaField<{
        value: fields.NumberField<number, number, true, false, true>;
    }>;
    collisionDamage: fields.SchemaField<{
        value: fields.StringField<string, string, true, false, true>;
    }>;
    immunities: fields.ArrayField<
        fields.SchemaField<{
            type: fields.StringField<ImmunityType, ImmunityType, true, false, false>;
            exceptions: fields.ArrayField<fields.StringField<ImmunityType, ImmunityType, true, false, false>>;
        }>
    >;
    weaknesses: fields.ArrayField<
        fields.SchemaField<{
            type: fields.StringField<WeaknessType, WeaknessType, true, false, false>;
            value: fields.NumberField<number, number, true, false, true>;
            exceptions: fields.ArrayField<fields.StringField<WeaknessType, WeaknessType, true, false, false>>;
        }>
    >;
    resistances: fields.ArrayField<
        fields.SchemaField<{
            type: fields.StringField<ResistanceType, ResistanceType, true, false, false>;
            value: fields.NumberField<number, number, true, false, true>;
            exceptions: fields.ArrayField<fields.StringField<ResistanceType, ResistanceType, true, false, false>>;
            doubleVs: fields.ArrayField<fields.StringField<ResistanceType, ResistanceType, true, false, false>>;
        }>
    >;
    emitsSound: DataUnionField<
        | fields.StringField<"encounter", "encounter", true, false, false>
        | fields.BooleanField<boolean, boolean, true, false, false>,
        true,
        false,
        true
    >;
};

type MechAttributesSource = fields.SourceFromSchema<MechAttributesSchema>;

type MechDetailsSchema = {
    description: fields.HTMLField;
    level: fields.SchemaField<{
        value: fields.NumberField<number, number, true, false, true>;
    }>;
    price: fields.NumberField<number, number, true, false, true>;
    space: fields.SchemaField<{
        long: fields.NumberField<number, number, true, false, true>;
        wide: fields.NumberField<number, number, true, false, true>;
        high: fields.NumberField<number, number, true, false, true>;
    }>;
    crew: fields.StringField<string, string, true, false, true>;
    passengers: fields.StringField<string, string, true, false, true>;
    pilotingCheck: fields.StringField<string, string, true, false, true>;
    AC: fields.NumberField<number, number, true, false, true>;
    speed: fields.StringField<string, string, true, false, true>;
    /** Information concerning the publication from which this actor originates */
    publication: PublicationField;
};

interface MechSystemSource extends fields.SourceFromSchema<MechSystemSchema> {
    schema?: never;
}

interface MechHitPoints extends ActorHitPoints {
    brokenThreshold: number;
}

interface MechAttributes extends ActorAttributes, Omit<MechAttributesSource, AttributesSourceOmission> {
    ac: ArmorClassTraceData;
    hp: MechHitPoints;
    immunities: Immunity[];
    weaknesses: Weakness[];
    resistances: Resistance[];
    initiative?: never;
    shield?: never;
}

type AttributesSourceOmission = "immunities" | "weaknesses" | "resistances";

interface MechDetails extends ActorDetails, fields.SourceFromSchema<MechDetailsSchema> {}

interface TokenDimensions {
    width: number;
    height: number;
}

export { MechSystemData };
export type { TokenDimensions, MechSource, MechSystemSchema, MechTrait };
