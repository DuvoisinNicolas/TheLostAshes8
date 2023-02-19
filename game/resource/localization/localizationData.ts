import { AbilityLocalization, LocalizationData, ModifierLocalization, StandardLocalization } from "~generator/localizationInterfaces";
import { Language } from "../languages";

export function GenerateLocalizationData(): LocalizationData
{
    // This section can be safely ignored, as it is only logic.
    //#region Localization logic
    // Arrays
    const Abilities: Array<AbilityLocalization> = new Array<AbilityLocalization>();
    const Modifiers: Array<ModifierLocalization> = new Array<ModifierLocalization>();
    const StandardTooltips: Array<StandardLocalization> = new Array<StandardLocalization>();    

    // Create object of arrays
    const localization_info: LocalizationData =
    {
        AbilityArray: Abilities,
        ModifierArray: Modifiers,
        StandardArray: StandardTooltips,        
    };
    //#endregion

    // -------------------ABILITIES----------------------
    // Wraith King
    Abilities.push({
        ability_classname: "my_skeleton_king_hellfire_blast",
        name: "Skeleton Fire blast",
        description: "Fires a skull that stuns the target for {blast_stun_duration} seconds and deals damages.\n Also spawns {skeleton_count} skeleton near the target.\n Skeletons lasts for {skeleton_duration} seconds, and they have {hp_ratio} times your hp, and {attack_ratio} times your damages."
    });
    Abilities.push({
        ability_classname: "my_skeleton_king_mortal_strike",
        name: "Skeleton King Strike",
        description: "Your attacks have {crit_chance}% chances to crit for {crit_mult}% damages. \n Also spawns a skeleton each time you crit. \n Skeletons lasts for {skeleton_duration} seconds, and they have {hp_ratio} times your hp, and {attack_ratio} times your damages."
    });
    Abilities.push({
        ability_classname: "my_skeleton_king_skeleton_strength",
        name: "Skeleton Strength",
        description: "Whenever one of your skeleton dives, you get a stack.\n Each stack grants you {bonus_strength} bonus strength.\n You can stack up to {max_stacks}."
    });


    // -------------------MODIFIERS----------------------
    Modifiers.push({
        modifier_classname: "modifier_my_banana",
        name: "Banana",
        description: `+{${LocalizationModifierProperty.BASEATTACK_BONUSDAMAGE}} Base Damage.`
    });
    Modifiers.push({
        modifier_classname: "modifier_my_skeleton_king_skeleton_strength",
        name: "Skeleton Strength",
        description: `Currently grants you +{${LocalizationModifierProperty.EXTRA_STRENGTH_BONUS}} bonus strength.`
    });


    // Return data to compiler
    return localization_info;
}
