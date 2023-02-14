import { registerAbility, BaseAbility, registerModifier, BaseModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_my_skeleton_king_skeleton_strength extends BaseModifier {

    bonus_strength = 0
    strength_to_add = 0

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
        this.bonus_strength = ability.GetSpecialValueFor("bonus_strength")
        print(this.bonus_strength);
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.ON_DEATH,
            ModifierFunction.STATS_STRENGTH_BONUS
        ]
    }

    OnDeath(event: ModifierInstanceEvent): void {
        if (event.unit.GetUnitName() == "npc_my_dota_wraith_king_skeleton_warrior"){
            this.strength_to_add += this.bonus_strength
        }
    }

    GetModifierExtraStrengthBonus(): number {
        return this.strength_to_add
    }
    
}

@registerAbility()
export class my_skeleton_king_skeleton_strength extends BaseAbility
{   
    Spawn(): void {
        this.SetLevel(1)
    }
    OnAbilityUpgrade(){
        let caster = (this.GetCaster() as CDOTA_BaseNPC_Hero);
        caster.AddNewModifier(caster, this, modifier_my_skeleton_king_skeleton_strength.name, {})
    }
}