package org.vindinium.server

import scala.util.{ Try, Success, Failure }

case class Game(
    id: String,
    training: Boolean,
    board: Board,
    hero1: Hero,
    hero2: Hero,
    hero3: Hero,
    hero4: Hero,
    spawnPos: Pos,
    turn: Int = 0,
    maxTurns: Int,
    status: Status) {

  val heroes = List(hero1, hero2, hero3, hero4)

  def heroId = turn % heroes.size + 1
  def hero: Option[Hero] = heroes lift (turn % heroes.size)
  def hero(id: Int): Hero = heroes find (_.id == id) getOrElse hero1
  def hero(pos: Pos): Option[Hero] = heroes find (_.pos == pos)
  def heroByToken(token: String): Option[Hero] = heroes find (_.token == token)
  def heroByName(name: String): Option[Hero] = heroes find (_.name == name)

  def heroOrDefault: Hero = hero getOrElse hero1

  def step = if (finished) this else {
    val next = copy(turn = turn + 1)
    if (next.turn > maxTurns) next.copy(status = Status.TurnMax) else next
  }

  def setTimedOut = hero match {
    case None => this
    case Some(hero) => withHero(hero.setTimedOut) match {
      case game if game.heroes.count(_.crashed) == 4 => game.copy(status = Status.AllCrashed)
      case game                                      => game
    }
  }

  def names = heroes.map(_.name)

  def hasManyNames = names.distinct.size > 1

  def withHero(hero: Hero): Game = withHero(hero.id, _ => hero)

  def withHero(id: Int, f: Hero => Hero): Game = copy(
    hero1 = if (id == 1) f(hero1) else hero1,
    hero2 = if (id == 2) f(hero2) else hero2,
    hero3 = if (id == 3) f(hero3) else hero3,
    hero4 = if (id == 4) f(hero4) else hero4)

  def spawnPosOf(hero: Hero) = hero.id match {
    case 1 => spawnPos
    case 2 => board mirrorX spawnPos
    case 3 => board mirrorXY spawnPos
    case _ => board mirrorY spawnPos
  }

  def withTraining(v: Boolean) = copy(training = v)

  def withBoard(f: Board => Board) = copy(board = f(board))

  def start = copy(status = Status.Started)

  def started = status == Status.Started
  def finished = status.finished

  def arena = !training

  def hasUserId(userId: String) = heroes.exists(_.userId == Some(userId))

  override def toString = s"Game[$id]: $status, turn $turn"

  def render = board.render
}
