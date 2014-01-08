package org.jousse
package bot

case class Hero(
    number: Int,
    name: String,
    pos: Pos,
    life: Int,
    gold: Int) {

  def moveTo(p: Pos) = copy(pos = p)

  def drinkBeer = copy(life = math.min(Hero.maxLife, life + Hero.beerEffect))

  def render = s"@$number"
}

object Hero {

  val maxLife = 100
  val beerEffect = 50
}
