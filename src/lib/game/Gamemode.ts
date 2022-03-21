import { teamColors } from "../../globals";
import { Player } from "../player/Player";

export class Gamemode {
    // game defining settings
    respawn = false;
    lives = false;
    static instance: Gamemode;

    constructor(_players: Player[], _teamsEnabled=false) {
        return;
    }

    healthText(player: Player, lineNum: number) {
        if (lineNum == 1) {
            return `Combo: ${player.combo}`;
        } else {
            return `Kill Count: ${player.killCount}`;
        }
    }

    setup() {
        return;
        // Not for every gamemode,
        // but Juggernaut will need this to set the juggernaut and all the players teams.
        // Juggernaut should also be its own class! (inaccessible by anyone except the gamemode)
    }

    isGameOver() {
        return false;
    }

    whoWon() {
        return ["[NAME]", "color"];
    }
}

export class Ffa extends Gamemode {
    // ffa: last player/team alive wins!
    players: Player[];
    teamsEnabled: boolean;

    playersInGame: number[] = [];
    teamsInGame: number[] = [];

    constructor(players: Player[], teamsEnabled=false) {
        super(players, teamsEnabled);
        this.players = players;
        this.respawn = false;
        this.lives = false;
        this.teamsEnabled = teamsEnabled;
        Gamemode.instance = this;
    }

    isGameOver() {
        this.playersInGame = [];

        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].health.health > 0) {
                this.playersInGame.push(i);
            }
        }

        if (this.playersInGame.length <= 1) {
            return true;
        }

        if (this.teamsEnabled) {
            this.teamsInGame = [];

            for (let i = 0; i < this.players.length; i++) {
                if (this.teamsInGame.indexOf(this.players[i].team) == -1 && this.players[i].health.health > 0) {
                    this.teamsInGame.push(this.players[i].team);
                }
            }
            
            if (this.teamsInGame.length == 1) {
                return true;
            }
        }

        return false;
    }

    whoWon() {
        if (this.playersInGame.length == 0) return ["No one", "inherit"];
        if (this.teamsInGame[0] < 5) return [`[Team ${this.teamsInGame[0]}]`, teamColors[this.teamsInGame[0] - 1]];
        return [`[Player ${this.players[this.playersInGame[0]].playerNum}]`, this.players[this.playersInGame[0]].health.color];
    }
}

export class Deathmatch extends Gamemode { 
    // First to 10 kills win and if its teams first team to 10 kills wins!
    players: Player[];
    teamsEnabled: boolean;

    killsToWin: number;
    winner: any[] = ["Player", 0];
    
    constructor(players: Player[], teamsEnabled=false) {
        super(players, teamsEnabled);
        this.players = players;
        this.respawn = true;
        this.lives = false;
        this.teamsEnabled = teamsEnabled;
        Gamemode.instance = this;

        this.killsToWin = parseInt(localStorage.getItem("deathmatchkills")) || 5;
    }

    healthText(player: Player, lineNum: number) {
        if (lineNum == 1) {
            return `Death Count: ${player.deaths}`;
        } else {
            return `Kill Count: ${player.killCount}`;
        }
    }

    isGameOver() {
        if (this.winner[1] != 0) return true;

        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].killCount >= this.killsToWin && this.players[i].team > 4) {
                this.winner = ["Player", this.players[i].playerNum];
                return true;
            }
        }

        if (this.teamsEnabled) {
            // get all the players on a team
            let teamXkillCount = [0, 0, 0, 0];
            
            for (let i = 0; i < this.players.length; i++) {
                if (this.players[i].team < 5) {
                    teamXkillCount[this.players[i].team - 1] += this.players[i].killCount;
                }
            }

            for (let i = 0; i < teamXkillCount.length; i++) {
                if (teamXkillCount[i] >= this.killsToWin) {
                    this.winner = ["Team", i + 1];
                    return true;
                }
            }
        }

        return false;
    }

    whoWon() {
        let color = "#017225";

        if (this.winner[0] == "Team") {
            color = teamColors[this.winner[1] - 1];
        } else if (this.winner[0] == "Player") {
            color = this.players[this.winner[1] - 1].health.color;
        }

        return [`[${this.winner[0]} ${this.winner[1]}]`, color];
    }
}

export class Stock extends Gamemode {
    // stock: last player/team with lives left wins!
    players: Player[];
    teamsEnabled: boolean;

    playersInGame: number[] = [];
    teamsInGame: number[] = [];

    constructor(players: Player[], teamsEnabled=false) {
        super(players, teamsEnabled);
        this.players = players;
        this.respawn = true;
        this.lives = true;
        this.teamsEnabled = teamsEnabled;
        Gamemode.instance = this;
    }

    healthText(player: Player, lineNum: number) {
        if (lineNum == 1) {
            return `Lives: ${player.lives}`;
        } else {
            return `Kill Count: ${player.killCount}`;
        }
    }

    isGameOver() {
        this.playersInGame = [];

        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].lives > 0) {
                this.playersInGame.push(i);
            }
        }

        if (this.playersInGame.length <= 1) {
            return true;
        }

        if (this.teamsEnabled) {
            this.teamsInGame = [];

            for (let i = 0; i < this.players.length; i++) {
                if (this.teamsInGame.indexOf(this.players[i].team) == -1 && this.players[i].lives > 0) {
                    this.teamsInGame.push(this.players[i].team);
                }
            }
            
            if (this.teamsInGame.length == 1) {
                return true;
            }
        }

        return false;
    }

    whoWon() {
        if (this.playersInGame.length == 0) return ["No one", "inherit"];
        if (this.teamsInGame[0] < 5) return [`[Team ${this.teamsInGame[0]}]`, teamColors[this.teamsInGame[0] - 1]];
        return [`[Player ${this.players[this.playersInGame[0]].playerNum}]`, this.players[this.playersInGame[0]].health.color];
    }
}

export class Juggernaut extends Gamemode {
    // juggernaut: the Juggernaut or the Team win
    players: Player[];
    teamsEnabled: boolean;

    teamsInGame: number[] = [];

    constructor(players: Player[], _teamsEnabled: Boolean) {
        super(players, true);
        this.players = players;
        this.respawn = true;
        this.lives = true;
        this.teamsEnabled = true;
        Gamemode.instance = this;
    }

    setup() {
        // Set everyone but the Juggernaut on the same team!

        let selected = false;
        while (!selected) {
            // make random number
            let randomPlayer = Math.floor(Math.random() * 4);

            console.log(selected, randomPlayer, localStorage.getItem(`player${randomPlayer + 1}enable`));

            // check if that random number's player is enabled
            if (localStorage.getItem(`player${randomPlayer + 1}enable`) == "true") {
                // set the random player to juggernaut and make it team 1
                this.players[randomPlayer].class = "Juggernaut";
                this.players[randomPlayer].reload();
                this.players[randomPlayer].team = 1;
                this.players[randomPlayer].lives = 1;
                this.players[randomPlayer].screenObject.shadowColor = "#A254DF";

                // set all other players to team 2
                for (let i = 0; i < this.players.length; i++) {
                    if (i != randomPlayer) {
                        this.players[i].team = 2;
                        this.players[i].screenObject.shadowColor = "#000000AA";
                    }
                }

                selected = true;
            }
        }
    }

    isGameOver() {
        this.teamsInGame = [];

        for (let i = 0; i < this.players.length; i++) {
            if (this.teamsInGame.indexOf(this.players[i].team) == -1 && this.players[i].lives > 0) {
                this.teamsInGame.push(this.players[i].team);
            }
        }
        
        if (this.teamsInGame.length == 1) {
            return true;
        }

        return false;
    }

    whoWon() {
        if (this.teamsInGame.length == 0) return ["No one", "inherit"]

        if (this.teamsInGame[0] == 1) return ["[Juggernaut]", "#A254DF"];
        if (this.teamsInGame[0] == 2) return ["[Players]", "#00FF00"];

        return ["The Game Broke!", "#FF0000"];
    }
}
