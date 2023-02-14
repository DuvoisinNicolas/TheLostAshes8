import { registerAbility, BaseAbility, registerModifier, BaseModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_my_skeleton_king_mortal_strike extends BaseModifier {

    critChance = 0;
    critMult = 0;

    IsHidden(){
        return true;
    }

    IsDebuff(): boolean {
        return false;
    }

    IsPurgable(): boolean {
        return false;
    }

    OnCreated(params: object) : void {
        const ability = this.GetAbility()!;
        this.critChance = ability.GetSpecialValueFor("crit_chance")
        this.critMult = ability.GetSpecialValueFor("crit_mult")
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.PREATTACK_CRITICALSTRIKE,
        ]
    }

    RollChance(crit_chance: number) : boolean{
        let rand = math.random()
        return  (rand<(crit_chance/100))
    }

    GetModifierPreAttack_CriticalStrike(event: ModifierAttackEvent): number {
        if (this.RollChance(this.critChance)) {
            let ability = this.GetAbility()!
            let caster = (this.GetCaster() as CDOTA_BaseNPC_Hero);
            const unit_duration = ability.GetSpecialValueFor("skeleton_duration")
            let unitName = "npc_my_dota_wraith_king_skeleton_warrior"    

            let hp_ratio = ability.GetSpecialValueFor("hp_ratio")
            let attack_ratio = ability.GetSpecialValueFor("attack_ratio")
    
            let hp = hp_ratio * caster.GetMaxHealth()
            let attack = attack_ratio * caster.GetAttackDamage()

            let summoned_unit = CreateUnitByName(
                unitName,
                caster.GetOrigin(),
                true,
                caster,
                caster.GetOwner(),
                caster.GetTeamNumber()
            )
            summoned_unit.SetBaseMaxHealth(hp)
            summoned_unit.SetBaseMaxHealth(hp)
            summoned_unit.SetBaseDamageMin(attack)
            summoned_unit.SetBaseDamageMax(attack)

            summoned_unit.SetControllableByPlayer(caster.GetPlayerID(), false)
            summoned_unit.SetOwner(caster)
            summoned_unit.AddNewModifier(caster, ability, "modifier_generic_summon_timer", {duration: unit_duration})
            summoned_unit.AddNewModifier(caster, undefined, "modifier_kill", {duration: unit_duration})
            return this.critMult;
        }
        else{
            return 100;
        }
    }
    
    
}

@registerAbility()
export class my_skeleton_king_mortal_strike extends BaseAbility
{   
    OnAbilityUpgrade(){
        let caster = (this.GetCaster() as CDOTA_BaseNPC_Hero);
        caster.AddNewModifier(caster, this, modifier_my_skeleton_king_mortal_strike.name, {})
    }
}