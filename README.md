*Four legendary heroes were fighting for the land of Vindinium*

*Making their way in the dangerous woods*

*Slashing goblins and stealing gold mines*

*And looking for a tavern where to drink their gold*

Game rules: https://bitbucket.org/vjousse/24hcodebot/wiki/Rules

---------

db.user.ensureIndex({name:1},{unique:true})
db.user.ensureIndex({key:1},{unique:true})
db.user.ensureIndex({elo:-1})

db.replay.ensureIndex({playedAt: -1})
