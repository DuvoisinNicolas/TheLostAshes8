import { registerAbility, BaseAbility } from "../../../lib/dota_ts_adapter";

@registerAbility()
export class my_skeleton_king_hellfire_blast extends BaseAbility
{   
    sound_cast: string = "Hero_SkeletonKing.Hellfireblast.Cast";
    sound_impact: string = "Hero_SkeletonKing.Hellfireblast.Impact";
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
                bDodgeable: false,
                bProvidesVision: true,
                iMoveSpeed: blast_speed,
            })
    }

    OnProjectileHit(target: CDOTA_BaseNPC | undefined, location: Vector)
    {
        if (!target) return;
        const blast_damage = this.GetAbilityDamage();

        EmitSoundOn(this.sound_impact, target);

        let damage = blast_damage;
        

        ApplyDamage(
            {
                attacker: this.GetCaster(),
                damage: damage,
                damage_type: DamageTypes.MAGICAL,
                victim: target,
                ability: this,
                damage_flags: DamageFlag.NONE
            });
    }
    
    
}