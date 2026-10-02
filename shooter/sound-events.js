// Keep collision feedback independent of scoring: a nonlethal hit still makes sound.
export function createSoundObserver(){
  const health=new WeakMap();let enemies=[],shield=0,hp=0,score=0;
  return{
    before(game){enemies=game.enemies;shield=game.shield;hp=game.hp;score=game.score;for(const enemy of enemies)health.set(enemy,enemy.hp)},
    after(game,play){
      if(game.shield<shield||game.hp<hp)play('damage');
      if(game.score>score||enemies.some(enemy=>enemy.hp<(health.get(enemy)??enemy.hp)))play('hit');
    }
  };
}
