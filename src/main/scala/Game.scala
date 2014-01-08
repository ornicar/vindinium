package org.jousse
package bot
import scala.util.{ Try, Success, Failure }

case class Hero(
  number: Int,
  name: String,
  pos: Pos,
  life: Int,
  gold: Int)

case class Game(
    id: String,
    board: Board,
    hero1: Hero,
    hero2: Hero,
    hero3: Hero,
    hero4: Hero,
    turn: Int = 0) {

  def heroes = List(hero1, hero2, hero3, hero4)

  def hero: Hero = hero(turn % 4) 
  def hero(number: Int): Hero = heroes lift number getOrElse hero1

  def step(withBoard: Board => Board) = copy(
    turn = turn + 1,
    board = withBoard(board)
  )
}
