import { Rarity } from "@module/data.ts";
import { DamageType } from "@system/damage/types.ts";
import fields = foundry.data.fields;
import { WeaponTrait } from "@item/weapon/types.ts";

type MechTierData = {
    tier: fields.NumberField<number, number, true, false>;
    shieldPoints: fields.NumberField<number, number, true, false>;
    hardnessBonus: fields.NumberField<number, number, true, false>;
    baseArmor: fields.NumberField<number, number, true, false>;
    baseSaveBonus: fields.NumberField<number, number, true, false>;
    baseAttackBonus: fields.NumberField<number, number, true, false>;
    strengthBonus: fields.NumberField<number, number, true, false>;
}

type MechLowerLimbs = {
    hitPointBase: fields.NumberField<number, number, true, false>;
    hitPointBonus: fields.NumberField<number, number, true, false>;
    armorBonus: fields.NumberField<number, number, true, false>;
    fortBonus: fields.NumberField<number, number, true, false>;
    refBonus: fields.NumberField<number, number, true, false>;
    limbSlots: fields.NumberField<number, number, true, false>;
    speedModifier: fields.NumberField<number, number, true, false>;
    // WIP there may be a movment type I can re-use
    otherMovement: fields.NumberField<number, number, true, false>;
    cost: fields.NumberField<number, number, true, false>;
}

// type MechOperatorsRange = {
//     min: fields.NumberField<number, number, true, false>;
//     max: fields.NumberField<number, number, true, false>;
// }

type MechFrameSchema = {
    // WIP need to understand how to do this
    // size: ActorSizePF2e;
    baseHP: fields.NumberField<number, number, true, false, true>;
    // hpPerLevel: fields.NumberField<number, number, true, false>;
    // hardness: fields.NumberField<number, number, true, false>;
    // armor: fields.NumberField<number, number, true, false>;
    // fortSave: fields.NumberField<number, number, true, false>;
    refSave: fields.NumberField<number, number, true, false, true>;
    // speed: unknown;
    // strengthAddition: fields.NumberField<number, number, true, false>;
    // frameSlots: fields.NumberField<number, number, true, false>;
    // auxSlots: fields.NumberField<number, number, true, false>;
    // WIP should we use this
    // operators: fields.ObjectField<MechOperatorsRange, MechOperatorsRange, true, false, false>;
    // cost: fields.NumberField<number, number, true, false>;
}

type MechUpperLimps = {
    hitPointBonus: fields.NumberField<number, number, true, false>;
    armorBonus: fields.NumberField<number, number, true, false>;
    upperLimbSlots: fields.NumberField<number, number, true, false>;
    meleeAttackBonus: fields.NumberField<number, number, true, false>;
    rangeAttackBonus: fields.NumberField<number, number, true, false>;
    // WIP holding off of this for now
    // specialModifier: (systemData: MechSystemData) => void;
    cost: fields.NumberField<number, number, true, false>;
}

type MechPowerCoreSchema = {
    coreName: fields.StringField<string>;
    coreMKModel: fields.NumberField<number, number, true, false>;
    rate: fields.NumberField<number, number, true, false>;
    initialPower: fields.NumberField<number, number, true, false>;
    maxPower: fields.NumberField<number, number, true, false>;
    cost: fields.NumberField<number, number, true, false>;
}

enum SlotLocationsSchema {
    frame = 'Frame',
    lower = 'Lower',
    upper = 'Upper',
}

type MechWeaponTraitsSchema = {
    value: fields.ArrayField<fields.StringField<WeaponTrait, WeaponTrait, true, false, false>>;
    rarity: fields.StringField<Rarity, Rarity, true, false, true>;
};

enum MechWeaponType {
    ranged = "Ranged",
    melee = "Melee"
} 

// WIP Unused for now, look into how get swords creates actions
type MechWeaponsSchema = {
    type: fields.StringField<MechWeaponType, MechWeaponType, true, false, false>;
    traits: fields.SchemaField<MechWeaponTraitsSchema>;
    // Wip should limit to 0-4 unknown how to do that yet
    damageCategory: fields.NumberField<number, number, true, false>;
    damageType: fields.StringField<DamageType, DamageType, true, false, false>;
    critical: fields.StringField<string>;
    slots: fields.NumberField<number, number, true, false>;
    slotLocations: fields.ArrayField<fields.StringField<SlotLocationsSchema, SlotLocationsSchema, true, false, false>>
    capacity: fields.NumberField<number, number, true, false>;
    cost: fields.NumberField<number, number, true, false>;
}

export type {
    MechFrameSchema,
    MechLowerLimbs,
    MechUpperLimps,
    MechPowerCoreSchema,
    MechTierData,
    MechWeaponsSchema
}