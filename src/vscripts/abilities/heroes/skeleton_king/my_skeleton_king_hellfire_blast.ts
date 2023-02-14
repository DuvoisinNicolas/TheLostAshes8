import { registerAbility, BaseAbility, registerModifier, BaseModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_my_skeleton_king_hellfire_blast extends BaseModifier {
    particle_stun = "particles/generic_gameplay/generic_stunned.vpcf";

    IsHidden(){
        return false;
    }

    IsDebuff(): boolean {
        return true;
    }

    IsPurgable(): boolean {
        return true;
    }

    OnCreated(params: object): void {     
        const particle = ParticleManager.CreateParticle(this.particle_stun, ParticleAttachment.OVERHEAD_FOLLOW, this.GetParent());
        ParticleManager.SetParticleControlEnt(particle, 1, this.GetParent(), ParticleAttachment.ABSORIGIN_FOLLOW, "hitloc", this.GetParent().GetAbsOrigin(), true);
        this.AddParticle(particle, false, false, -1, false, true);
    }

    CheckState() {
        return {[ModifierState.STUNNED]: true}
    }
}

@registerAbility()
export class my_skeleton_king_hellfire_blast extends BaseAbility
{   
    sound_cast: string = "Hero_SkeletonKing.Hellfire_Blast";
    sound_impact: string = "Hero_SkeletonKing.Hellfire_BlastImpact";
    projectile_hellfire_blast: string = "particles/units/heroes/hero_skeletonking/skeletonking_hellfireblast.vpcf";

    OnSpellStart()
    {
        const target = this.GetCursorTarget();
        const blast_speed = this.GetSpecialValueFor("blast_speed");

        EmitSoundOn(this.sound_cast, this.GetCaster());
        
        ProjectileManager.CreateTrackingProjectile(
            {
                Ability: this,
                EffectName: this.projectile_hellfire_blast,
                Source: this.GetCaster(),
                Target: target,
                iMoveSpeed: blast_speed,
            })
    }

    OnProjectileHit(target: CDOTA_BaseNPC | undefined, location: Vector)
    {
        if (!target) return;
        let caster = (this.GetCaster() as CDOTA_BaseNPC_Hero);
        const blast_damage = this.GetAbilityDamage();
        const blast_stun_duration = this.GetSpecialValueFor("blast_stun_duration");
        const unit_duration = this.GetSpecialValueFor("skeleton_duration")

        let unitName = "npc_my_dota_wraith_king_skeleton_warrior"
        let skeleton_count = this.GetSpecialValueFor("skeleton_count");

        let hp_ratio = this.GetSpecialValueFor("hp_ratio")
        let attack_ratio = this.GetSpecialValueFor("attack_ratio")

        let hp = hp_ratio * caster.GetMaxHealth()
        let attack = attack_ratio * caster.GetAttackDamage()
        

        for ( let i=0; i< skeleton_count; ++i) {
            let summoned_unit = CreateUnitByName(
                unitName,
                target.GetOrigin(),
                true,
                this.GetCaster(),
                caster.GetOwner(),
                caster.GetTeamNumber()
            )
            summoned_unit.SetBaseMaxHealth(hp)
            summoned_unit.SetBaseMaxHealth(hp)
            summoned_unit.SetBaseDamageMin(attack)
            summoned_unit.SetBaseDamageMax(attack)

            summoned_unit.SetControllableByPlayer(caster.GetPlayerID(), false)
            summoned_unit.SetOwner(caster)
            summoned_unit.AddNewModifier(caster, this, "modifier_generic_summon_timer", {duration: unit_duration})
            summoned_unit.AddNewModifier(caster, undefined, "modifier_kill", {duration: unit_duration})
        }

        EmitSoundOn(this.sound_impact, target);

        let damage = blast_damage;
        
        ApplyDamage(
            {
                attacker: this.GetCaster(),
                damage: damage,
                damage_type: DamageTypes.MAGICAL,
                victim: target,
                ability: this,
            });
        
        target.AddNewModifier(this.GetCaster(), this, modifier_my_skeleton_king_hellfire_blast.name, { duration: blast_stun_duration })
    }
    
    
}