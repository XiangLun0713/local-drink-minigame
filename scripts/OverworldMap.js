class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};
    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;
    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;
    this.isCutscenePlaying = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage,

      utils.withGrid(31.5) - cameraPerson.x,
      utils.withGrid(9) - cameraPerson.y
    );
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage,
      utils.withGrid(31.5) - cameraPerson.x,
      utils.withGrid(9) - cameraPerson.y
    );
  }

  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach((key) => {
      let object = this.gameObjects[key];
      object.id = key;

      //TODO: determine if this object should actually mount
      object.mount(this);
    });
  }
  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      });
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;

    //Reset NPCs to do their idle behavior
    Object.values(this.gameObjects).forEach((object) =>
      object.doBehaviorEvent(this)
    );
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find((object) => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`;
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {
      this.startCutscene(match.talking[0].events);
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene(match[0].events);
    }
  }
  addWall(x, y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x, y) {
    delete this.walls[`${x},${y}`];
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const { x, y } = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x, y);
  }
}

//Objects of all the maps in game
window.OverworldMaps = {
  firstFloor: {
    lowerSrc: "/assets/map.png",
    upperSrc: "/assets/mapUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(14),
        y: utils.withGrid(18),
      }),
      // dev npc
      dev: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(3),
        y: utils.withGrid(9),
        src: "/assets/dev.png",
        behaviorLoop: [{ type: "stand", direction: "left" }],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Zzz.. Zzz.. Zzz..",
              },
              {
                type: "textMessage",
                text: "...",
              },
              {
                type: "textMessage",
                text: "[You pick up the paper from the ground...]",
              },
              {
                type: "textMessage",
                text: '["Xiang Lun, the developer of this mini-game", it written]',
              },
              {
                type: "textMessage",
                text: "...",
              },
              {
                type: "textMessage",
                text: "[It seems like he is exhausted... Let's not disturb him.]",
              },
            ],
          },
        ],
      }),
      // middle counter npc
      npc1: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(14),
        y: utils.withGrid(10),
        src: "assets/npc2.png",
        behaviorLoop: [{ type: "stand", direction: "down" }],
      }),
      // entrance npc
      npc2: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(15),
        y: utils.withGrid(14),
        src: "assets/npc1.png",
        behaviorLoop: [{ type: "stand", direction: "down" }],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Welcome to My Tech Career Fair 2022 Virtual Booth!",
                faceHero: "npc2",
              },
            ],
          },
        ],
      }),
      // top right npc
      npc3: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(24),
        y: utils.withGrid(4),
        src: "assets/npc2.png",
        behaviorLoop: [{ type: "stand", direction: "left" }],
      }),
      // mid-left npc
      npc4: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(26),
        y: utils.withGrid(9),
        src: "assets/npc3.png",
        behaviorLoop: [{ type: "stand", direction: "left" }],
      }),
      // top left counter 1 npc
      npc5: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(10),
        y: utils.withGrid(3),
        src: "assets/npc1.png",
        behaviorLoop: [{ type: "stand", direction: "left" }],
      }),
      // top left counter 2 npc
      npc6: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(5),
        y: utils.withGrid(3),
        src: "assets/npc3.png",
        behaviorLoop: [{ type: "stand", direction: "right" }],
      }),
      // mid-left counter npc
      npc7: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(10),
        y: utils.withGrid(9),
        src: "assets/npc1.png",
        behaviorLoop: [{ type: "stand", direction: "left" }],
      }),
      // top mid counter 1 npc
      npc8: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(16),
        y: utils.withGrid(4),
        src: "assets/npc1.png",
        behaviorLoop: [{ type: "stand", direction: "down" }],
      }),
      // top mid counter 2 npc
      npc9: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(14),
        y: utils.withGrid(4),
        src: "assets/npc2.png",
        behaviorLoop: [{ type: "stand", direction: "down" }],
      }),
      // bottom-left counter npc
      npc10: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(7),
        y: utils.withGrid(14),
        src: "assets/npc3.png",
        behaviorLoop: [{ type: "stand", direction: "right" }],
      }),
      // bottom-right counter npc
      npc11: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(22),
        y: utils.withGrid(14),
        src: "assets/npc1.png",
        behaviorLoop: [{ type: "stand", direction: "left" }],
      }),
    },
    walls: {
      // left entrance
      [utils.asGridCoords(0, 0)]: true,
      [utils.asGridCoords(1, 0)]: true,
      [utils.asGridCoords(2, 0)]: true,
      [utils.asGridCoords(3, 0)]: true,
      [utils.asGridCoords(4, 0)]: true,
      [utils.asGridCoords(5, 0)]: true,
      [utils.asGridCoords(6, 0)]: true,
      [utils.asGridCoords(7, 0)]: true,
      [utils.asGridCoords(8, 0)]: true,
      [utils.asGridCoords(9, 0)]: true,
      [utils.asGridCoords(10, 0)]: true,
      [utils.asGridCoords(11, 0)]: true,
      [utils.asGridCoords(12, 0)]: true,
      [utils.asGridCoords(13, 0)]: true,
      [utils.asGridCoords(14, 0)]: true,
      [utils.asGridCoords(15, 0)]: true,
      [utils.asGridCoords(16, 0)]: true,
      [utils.asGridCoords(17, 0)]: true,
      [utils.asGridCoords(18, 0)]: true,
      [utils.asGridCoords(19, 0)]: true,
      [utils.asGridCoords(20, 0)]: true,
      [utils.asGridCoords(21, 0)]: true,
      [utils.asGridCoords(22, 0)]: true,
      [utils.asGridCoords(23, 0)]: true,
      [utils.asGridCoords(24, 0)]: true,
      [utils.asGridCoords(25, 0)]: true,
      [utils.asGridCoords(26, 0)]: true,
      [utils.asGridCoords(27, 0)]: true,
      [utils.asGridCoords(28, 0)]: true,
      [utils.asGridCoords(0, 1)]: true,
      [utils.asGridCoords(1, 1)]: true,
      [utils.asGridCoords(2, 1)]: true,
      [utils.asGridCoords(3, 1)]: true,
      [utils.asGridCoords(4, 1)]: true,
      [utils.asGridCoords(5, 1)]: true,
      [utils.asGridCoords(6, 1)]: true,
      [utils.asGridCoords(7, 1)]: true,
      [utils.asGridCoords(8, 1)]: true,
      [utils.asGridCoords(9, 1)]: true,
      [utils.asGridCoords(10, 1)]: true,
      [utils.asGridCoords(11, 1)]: true,
      [utils.asGridCoords(12, 1)]: true,
      [utils.asGridCoords(13, 1)]: true,
      [utils.asGridCoords(14, 1)]: true,
      [utils.asGridCoords(15, 1)]: true,
      [utils.asGridCoords(16, 1)]: true,
      [utils.asGridCoords(17, 1)]: true,
      [utils.asGridCoords(18, 1)]: true,
      [utils.asGridCoords(19, 1)]: true,
      [utils.asGridCoords(20, 1)]: true,
      [utils.asGridCoords(21, 1)]: true,
      [utils.asGridCoords(22, 1)]: true,
      [utils.asGridCoords(23, 1)]: true,
      [utils.asGridCoords(24, 1)]: true,
      [utils.asGridCoords(25, 1)]: true,
      [utils.asGridCoords(26, 1)]: true,
      [utils.asGridCoords(27, 1)]: true,
      [utils.asGridCoords(28, 1)]: true,
      [utils.asGridCoords(0, 2)]: true,
      [utils.asGridCoords(1, 2)]: true,
      [utils.asGridCoords(2, 2)]: true,
      [utils.asGridCoords(3, 2)]: true,
      [utils.asGridCoords(4, 2)]: true,
      [utils.asGridCoords(5, 2)]: true,
      [utils.asGridCoords(6, 2)]: true,
      [utils.asGridCoords(7, 2)]: true,
      [utils.asGridCoords(8, 2)]: true,
      [utils.asGridCoords(9, 2)]: true,
      [utils.asGridCoords(10, 2)]: true,
      [utils.asGridCoords(11, 2)]: true,
      [utils.asGridCoords(12, 2)]: true,
      [utils.asGridCoords(13, 2)]: true,
      [utils.asGridCoords(14, 2)]: true,
      [utils.asGridCoords(15, 2)]: true,
      [utils.asGridCoords(16, 2)]: true,
      [utils.asGridCoords(17, 2)]: true,
      [utils.asGridCoords(18, 2)]: true,
      [utils.asGridCoords(19, 2)]: true,
      [utils.asGridCoords(20, 2)]: true,
      [utils.asGridCoords(21, 2)]: true,
      [utils.asGridCoords(22, 2)]: true,
      [utils.asGridCoords(23, 2)]: true,
      [utils.asGridCoords(24, 2)]: true,
      [utils.asGridCoords(25, 2)]: true,
      [utils.asGridCoords(26, 2)]: true,
      [utils.asGridCoords(27, 2)]: true,
      [utils.asGridCoords(28, 2)]: true,
      [utils.asGridCoords(0, 3)]: true,
      [utils.asGridCoords(1, 3)]: true,
      [utils.asGridCoords(2, 3)]: true,
      [utils.asGridCoords(3, 3)]: true,
      [utils.asGridCoords(4, 3)]: true,
      [utils.asGridCoords(5, 3)]: true,
      [utils.asGridCoords(6, 3)]: true,
      [utils.asGridCoords(7, 3)]: true,
      [utils.asGridCoords(8, 3)]: true,
      [utils.asGridCoords(9, 3)]: true,
      [utils.asGridCoords(10, 3)]: true,
      [utils.asGridCoords(11, 3)]: true,
      [utils.asGridCoords(12, 3)]: true,
      [utils.asGridCoords(13, 3)]: true,
      [utils.asGridCoords(14, 3)]: true,
      [utils.asGridCoords(15, 3)]: true,
      [utils.asGridCoords(16, 3)]: true,
      [utils.asGridCoords(17, 3)]: true,
      [utils.asGridCoords(18, 3)]: true,
      [utils.asGridCoords(20, 3)]: true,
      [utils.asGridCoords(21, 3)]: true,
      [utils.asGridCoords(22, 3)]: true,
      [utils.asGridCoords(23, 3)]: true,
      [utils.asGridCoords(24, 3)]: true,
      [utils.asGridCoords(25, 3)]: true,
      [utils.asGridCoords(27, 3)]: true,
      [utils.asGridCoords(28, 3)]: true,
      [utils.asGridCoords(0, 4)]: true,
      [utils.asGridCoords(18, 4)]: true,
      [utils.asGridCoords(22, 4)]: true,
      [utils.asGridCoords(23, 4)]: true,
      [utils.asGridCoords(24, 4)]: true,
      [utils.asGridCoords(28, 4)]: true,
      [utils.asGridCoords(0, 5)]: true,
      [utils.asGridCoords(2, 5)]: true,
      [utils.asGridCoords(3, 5)]: true,
      [utils.asGridCoords(4, 5)]: true,
      [utils.asGridCoords(5, 5)]: true,
      [utils.asGridCoords(7, 5)]: true,
      [utils.asGridCoords(8, 5)]: true,
      [utils.asGridCoords(9, 5)]: true,
      [utils.asGridCoords(10, 5)]: true,
      [utils.asGridCoords(11, 5)]: true,
      [utils.asGridCoords(12, 5)]: true,
      [utils.asGridCoords(13, 5)]: true,
      [utils.asGridCoords(14, 5)]: true,
      [utils.asGridCoords(15, 5)]: true,
      [utils.asGridCoords(16, 5)]: true,
      [utils.asGridCoords(17, 5)]: true,
      [utils.asGridCoords(18, 5)]: true,
      [utils.asGridCoords(22, 5)]: true,
      [utils.asGridCoords(23, 5)]: true,
      [utils.asGridCoords(24, 5)]: true,
      [utils.asGridCoords(28, 5)]: true,
      [utils.asGridCoords(0, 6)]: true,
      [utils.asGridCoords(2, 6)]: true,
      [utils.asGridCoords(3, 6)]: true,
      [utils.asGridCoords(4, 6)]: true,
      [utils.asGridCoords(5, 6)]: true,
      [utils.asGridCoords(7, 6)]: true,
      [utils.asGridCoords(8, 6)]: true,
      [utils.asGridCoords(9, 6)]: true,
      [utils.asGridCoords(10, 6)]: true,
      [utils.asGridCoords(11, 6)]: true,
      [utils.asGridCoords(12, 6)]: true,
      [utils.asGridCoords(13, 6)]: true,
      [utils.asGridCoords(14, 6)]: true,
      [utils.asGridCoords(15, 6)]: true,
      [utils.asGridCoords(16, 6)]: true,
      [utils.asGridCoords(17, 6)]: true,
      [utils.asGridCoords(18, 6)]: true,
      [utils.asGridCoords(22, 6)]: true,
      [utils.asGridCoords(23, 6)]: true,
      [utils.asGridCoords(24, 6)]: true,
      [utils.asGridCoords(28, 6)]: true,
      [utils.asGridCoords(0, 7)]: true,
      [utils.asGridCoords(28, 7)]: true,
      [utils.asGridCoords(0, 8)]: true,
      [utils.asGridCoords(2, 8)]: true,
      [utils.asGridCoords(3, 8)]: true,
      [utils.asGridCoords(7, 8)]: true,
      [utils.asGridCoords(8, 8)]: true,
      [utils.asGridCoords(9, 8)]: true,
      [utils.asGridCoords(10, 8)]: true,
      [utils.asGridCoords(11, 8)]: true,
      [utils.asGridCoords(12, 8)]: true,
      [utils.asGridCoords(16, 8)]: true,
      [utils.asGridCoords(17, 8)]: true,
      [utils.asGridCoords(18, 8)]: true,
      [utils.asGridCoords(19, 8)]: true,
      [utils.asGridCoords(20, 8)]: true,
      [utils.asGridCoords(21, 8)]: true,
      [utils.asGridCoords(25, 8)]: true,
      [utils.asGridCoords(26, 8)]: true,
      [utils.asGridCoords(28, 8)]: true,
      [utils.asGridCoords(0, 9)]: true,
      [utils.asGridCoords(2, 9)]: true,
      [utils.asGridCoords(3, 9)]: true,
      [utils.asGridCoords(7, 9)]: true,
      [utils.asGridCoords(8, 9)]: true,
      [utils.asGridCoords(9, 9)]: true,
      [utils.asGridCoords(10, 9)]: true,
      [utils.asGridCoords(11, 9)]: true,
      [utils.asGridCoords(12, 9)]: true,
      [utils.asGridCoords(16, 9)]: true,
      [utils.asGridCoords(17, 9)]: true,
      [utils.asGridCoords(18, 9)]: true,
      [utils.asGridCoords(19, 9)]: true,
      [utils.asGridCoords(20, 9)]: true,
      [utils.asGridCoords(21, 9)]: true,
      [utils.asGridCoords(25, 9)]: true,
      [utils.asGridCoords(26, 9)]: true,
      [utils.asGridCoords(28, 9)]: true,
      [utils.asGridCoords(0, 10)]: true,
      [utils.asGridCoords(2, 10)]: true,
      [utils.asGridCoords(3, 10)]: true,
      [utils.asGridCoords(7, 10)]: true,
      [utils.asGridCoords(8, 10)]: true,
      [utils.asGridCoords(9, 10)]: true,
      [utils.asGridCoords(10, 10)]: true,
      [utils.asGridCoords(11, 10)]: true,
      [utils.asGridCoords(12, 10)]: true,
      [utils.asGridCoords(16, 10)]: true,
      [utils.asGridCoords(17, 10)]: true,
      [utils.asGridCoords(18, 10)]: true,
      [utils.asGridCoords(19, 10)]: true,
      [utils.asGridCoords(20, 10)]: true,
      [utils.asGridCoords(21, 10)]: true,
      [utils.asGridCoords(25, 10)]: true,
      [utils.asGridCoords(26, 10)]: true,
      [utils.asGridCoords(28, 10)]: true,
      [utils.asGridCoords(0, 11)]: true,
      [utils.asGridCoords(2, 11)]: true,
      [utils.asGridCoords(3, 11)]: true,
      [utils.asGridCoords(25, 11)]: true,
      [utils.asGridCoords(26, 11)]: true,
      [utils.asGridCoords(28, 11)]: true,
      [utils.asGridCoords(0, 12)]: true,
      [utils.asGridCoords(2, 12)]: true,
      [utils.asGridCoords(3, 12)]: true,
      [utils.asGridCoords(25, 12)]: true,
      [utils.asGridCoords(26, 12)]: true,
      [utils.asGridCoords(28, 12)]: true,
      [utils.asGridCoords(0, 13)]: true,
      [utils.asGridCoords(2, 13)]: true,
      [utils.asGridCoords(3, 13)]: true,
      [utils.asGridCoords(25, 13)]: true,
      [utils.asGridCoords(26, 13)]: true,
      [utils.asGridCoords(28, 13)]: true,
      [utils.asGridCoords(0, 14)]: true,
      [utils.asGridCoords(2, 14)]: true,
      [utils.asGridCoords(3, 14)]: true,
      [utils.asGridCoords(25, 14)]: true,
      [utils.asGridCoords(26, 14)]: true,
      [utils.asGridCoords(28, 14)]: true,
      [utils.asGridCoords(0, 15)]: true,
      [utils.asGridCoords(2, 15)]: true,
      [utils.asGridCoords(3, 15)]: true,
      [utils.asGridCoords(25, 15)]: true,
      [utils.asGridCoords(26, 15)]: true,
      [utils.asGridCoords(28, 15)]: true,
      [utils.asGridCoords(0, 16)]: true,
      [utils.asGridCoords(2, 16)]: true,
      [utils.asGridCoords(3, 16)]: true,
      [utils.asGridCoords(25, 16)]: true,
      [utils.asGridCoords(26, 16)]: true,
      [utils.asGridCoords(28, 16)]: true,
      [utils.asGridCoords(0, 17)]: true,
      [utils.asGridCoords(2, 17)]: true,
      [utils.asGridCoords(3, 17)]: true,
      [utils.asGridCoords(25, 17)]: true,
      [utils.asGridCoords(26, 17)]: true,
      [utils.asGridCoords(28, 17)]: true,
      [utils.asGridCoords(0, 18)]: true,
      [utils.asGridCoords(1, 18)]: true,
      [utils.asGridCoords(2, 18)]: true,
      [utils.asGridCoords(3, 18)]: true,
      [utils.asGridCoords(4, 18)]: true,
      [utils.asGridCoords(5, 18)]: true,
      [utils.asGridCoords(6, 18)]: true,
      [utils.asGridCoords(7, 18)]: true,
      [utils.asGridCoords(8, 18)]: true,
      [utils.asGridCoords(9, 18)]: true,
      [utils.asGridCoords(10, 18)]: true,
      [utils.asGridCoords(11, 18)]: true,
      [utils.asGridCoords(12, 18)]: true,
      [utils.asGridCoords(16, 18)]: true,
      [utils.asGridCoords(17, 18)]: true,
      [utils.asGridCoords(18, 18)]: true,
      [utils.asGridCoords(19, 18)]: true,
      [utils.asGridCoords(20, 18)]: true,
      [utils.asGridCoords(21, 18)]: true,
      [utils.asGridCoords(22, 18)]: true,
      [utils.asGridCoords(23, 18)]: true,
      [utils.asGridCoords(24, 18)]: true,
      [utils.asGridCoords(25, 18)]: true,
      [utils.asGridCoords(26, 18)]: true,
      [utils.asGridCoords(27, 18)]: true,
      [utils.asGridCoords(28, 18)]: true,
      [utils.asGridCoords(8, 13)]: true,
      [utils.asGridCoords(11, 13)]: true,
      [utils.asGridCoords(17, 13)]: true,
      [utils.asGridCoords(20, 13)]: true,
      [utils.asGridCoords(8, 14)]: true,
      [utils.asGridCoords(11, 14)]: true,
      [utils.asGridCoords(17, 14)]: true,
      [utils.asGridCoords(20, 14)]: true,
      [utils.asGridCoords(8, 15)]: true,
      [utils.asGridCoords(11, 15)]: true,
      [utils.asGridCoords(17, 15)]: true,
      [utils.asGridCoords(20, 15)]: true,
      [utils.asGridCoords(13, 19)]: true,
      [utils.asGridCoords(14, 19)]: true,
      [utils.asGridCoords(15, 19)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoords(14, 12)]: [
        {
          events: [
            // middle counter event
            {
              who: "hero",
              type: "stand",
              direction: "up",
            },
            {
              type: "textMessage",
              text: "Welcome to the first-floor of this virtual event!",
            },
            {
              type: "textMessage",
              text: "Here consists of the virtual booths for our Gold & BIK collaborators.",
            },
            {
              type: "textMessage",
              text: "You can go to the second floor through the elevator at the top right side of the map.",
            },
            {
              type: "textMessage",
              text: "There you will find the virtual booths of our Diamond & Platinum collaborators.",
            },
            {
              type: "textMessage",
              text: "Have fun!",
            },
          ],
        },
      ],
      [utils.asGridCoords(9, 14)]: [
        {
          events: [
            // Global intelligence event
            {
              who: "hero",
              type: "stand",
              direction: "left",
            },
            {
              type: "textMessage",
              text: "Hi! Welcome to the Global Intelligence Virtual Booth!",
            },
            {
              type: "textMessage",
              text: "Global Intelligence is the Technology Centre in Malaysia for GlobalVision Systems, Inc. (USA).",
            },
            {
              type: "textMessage",
              text: "GlobalVision Systems is the leading provider of the most advanced and comprehensive regulatory compliance, risk management, anti-money laundering and anti-fraud solutions for financial institutions.",
            },
            {
              type: "textMessage",
              text: "We are located in Menara Kembar Bank Rakyat building (Brickfields area), which is within a walking distance from KL Sentral LRT station.",
            },
            {
              type: "textMessage",
              text: "Please contact us for any info on our job opportunities via career@gv-systems.com or 03-2260 7655.",
            },
          ],
        },
      ],
      [utils.asGridCoords(20, 14)]: [
        {
          events: [
            // Deloitte event
            {
              who: "hero",
              type: "stand",
              direction: "right",
            },
            {
              type: "textMessage",
              text: "Hi! Welcome to the Deloitte Virtual Booth!",
            },
            {
              type: "textMessage",
              text: "Deloitte is the world’s leading professional services network with USD50.2 billion in revenue and over 345,000 professionals spanning more than 150 countries.",
            },
            {
              type: "textMessage",
              text: "A leading global provider of audit and assurance, consulting, financial advisory, risk advisory, tax, and related services, Deloitte currently serves four out of five Fortune Global 500® companies.",
            },
            {
              type: "textMessage",
              text: "Our shared culture and mission — to make an impact that matters — is evident not only in our work for clients, but also in our global WorldClass ambition, WorldClimate initiative, and our ALL IN diversity and inclusion strategy.",
            },
            {
              type: "textMessage",
              text: "Deloitte Malaysia is a member of the Deloitte Southeast Asia network, which comprises over 380 partners and 10,000 professionals in 25 office locations all over the region.",
            },
            {
              type: "textMessage",
              text: "We are supported by a vibrant and dynamic workforce of more than 2,400 employees and partners operating from 8 locations nationwide.",
            },
            {
              type: "textMessage",
              text: "From international assignments, secondment to overseas branches, and participating in Life At Deloitte, Sports Club and corporate social responsibility activities, at Deloitte you can define who you are and how you want your career to be.",
            },
            {
              type: "textMessage",
              text: "Please contact us for any info on our job opportunities via myhrum@deloitte.com.",
            },
          ],
        },
      ],
      [utils.asGridCoords(14, 6)]: [
        {
          events: [
            // AEXIS Technology event
            {
              who: "hero",
              type: "stand",
              direction: "up",
            },
            {
              type: "textMessage",
              text: "Hi! Welcome to the AEXIS Technology Virtual Booth!",
            },
            {
              type: "textMessage",
              text: "Aexis Technologies Sdn. Bhd. was incorporated in Malaysia on 27th July 2004.",
            },
            {
              type: "textMessage",
              text: "Our business activities involve around Information, Communication and Technology (ICT) pillars.",
            },
            {
              type: "textMessage",
              text: "We provide system integration services that support the growing demand of the current and future business environment.",
            },
            {
              type: "textMessage",
              text: "Aexis’ expertise lies in the experienced management and technical team coupled with solid understanding of the ICT environment.",
            },
            {
              type: "textMessage",
              text: "Geared to succeed, we will ensure our client’s success is our main reason of existence.",
            },
            {
              type: "textMessage",
              text: "Founded by highly experienced personnel from various backgrounds, Aexis is committed to deliver its promises.",
            },
            {
              type: "textMessage",
              text: "Our excellent team of technology experts will further take your organisation to greater heights.",
            },
            {
              type: "textMessage",
              text: "Our proven principal relationship will further enhance the cost effectiveness of your project requirements.",
            },
            {
              type: "textMessage",
              text: "Aexis offers you the technology that is current, required, and realizes your vision into success.",
            },
            {
              type: "textMessage",
              text: "We excel in advisory, managed services, secured environment and architect your solution to construct your desired technology requirements.",
            },
            {
              type: "textMessage",
              text: "Please contact us for any info on our job opportunities via hr@aexis.com.my or +603-7831 9082",
            },
          ],
        },
      ],
      [utils.asGridCoords(16, 6)]: [
        {
          events: [
            // RefineNetworks event
            {
              who: "hero",
              type: "stand",
              direction: "up",
            },
            {
              type: "textMessage",
              text: "Hi! Welcome to the RefineNetworks Virtual Booth!",
            },
            {
              type: "textMessage",
              text: "RefineNetworks was founded in 2008, throughout the years, we have number of successful implementations and we constantly embarked into emerging market.",
            },
            {
              type: "textMessage",
              text: "We constantly evolved with new skillset to being outstanding.",
            },
            {
              type: "textMessage",
              text: "Please contact us for any info on our job opportunities via recruit@refinenetworks.com.",
            },
          ],
        },
      ],
      [utils.asGridCoords(8, 9)]: [
        {
          events: [
            // Wistron event
            {
              who: "hero",
              type: "stand",
              direction: "right",
            },
            {
              type: "textMessage",
              text: "Hi! Welcome to the Wistron Virtual Booth!",
            },
            {
              type: "textMessage",
              text: "Wistron is a global leader providing state-of-the-art design, manufacturing, services, and systems for information and communication products to top branded companies worldwide.",
            },
            {
              type: "textMessage",
              text: "As one of the top 3 global makers of technology products, Wistron adapts cutting edge i4.0 technology and solution to its digitized smart manufacturing facility with automated production lines.",
            },
            {
              type: "textMessage",
              text: "Wistron is devoted to increasing the value of our services through non-stop development of innovative solutions in the areas of green recycling, cloud systems and services, and display vertical integration.",
            },
            {
              type: "textMessage",
              text: "Wistron is a Fortune Global 500 company with annual revenue exceeding US$29 billion and over 80,000 employees in over 10 manufacturing sites around the world.",
            },
            {
              type: "textMessage",
              text: "Wistron welcomes employees who are passionate about work, adaptable in a fast-paced environment and have a dynamic mindset to work with global colleagues surrounded by tomorrow’s technology!",
            },
            {
              type: "textMessage",
              text: "Please contact us for any info on our job opportunities via WMY_Recruitment@wistron.com or +603-31622888",
            },
          ],
        },
      ],
      [utils.asGridCoords(24, 9)]: [
        {
          events: [
            // Operion event
            {
              who: "hero",
              type: "stand",
              direction: "right",
            },
            {
              type: "textMessage",
              text: "Hi! Welcome to the Operion Virtual Booth!",
            },
            {
              type: "textMessage",
              text: "Operion Ecommerce & Software Sdn Bhd specialist in customisation software and mobile app development since 2014.",
            },
            {
              type: "textMessage",
              text: "We serve client worldwide regardless border, as long as there is a demand. Through out the years, we design a lot of custom made software to fulfil client needs.",
            },
            {
              type: "textMessage",
              text: "Besides, with our company 15 years experience in hiring internship and also fresh graduate, we train the interns to hold the skill set that able to improve themselves before they graduated and going into real workplace.",
            },
            {
              type: "textMessage",
              text: "1 company 1 technoprenuer is our vision to grow MALAYSIA economic through the use of technology.",
            },
            {
              type: "textMessage",
              text: "Please contact us for any info on our job opportunities via career@operion.com.my",
            },
          ],
        },
      ],
      [utils.asGridCoords(22, 4)]: [
        {
          events: [
            // Zetpy event
            {
              who: "hero",
              type: "stand",
              direction: "right",
            },
            {
              type: "textMessage",
              text: "Hi! Welcome to the Zetpy Virtual Booth!",
            },
            {
              type: "textMessage",
              text: "Zetpy.com, is a data technology platform built by zetpians with the goal to enable sellers, merchants and brands across South-East Asia to sell successfully locally, via online and offline channels (Omni-channel), and utilize the data insights to scale up their revenue, growth and customer’s loyalty.",
            },
            {
              type: "textMessage",
              text: "Our mission is simple, we want to help local sellers to sell successfully, locally.",
            },
            {
              type: "textMessage",
              text: "We are #ObsessedOverCustomers and We want to empower merchants to make better business decisions via Data and AI.",
            },
            {
              type: "textMessage",
              text: "Our vision is to be the #1 Omnichannel Data Tech Platform for Merchants in SouthEast Asia (SEA) ",
            },
            {
              type: "textMessage",
              text: "We help South East Asia (SEA) Merchants to sell successfully online and offline (Omnichannel), to grow their business via Automation, Sync, Data and Financing and to make Better business decisions via Data.",
            },
            {
              type: "textMessage",
              text: "Please contact us for any info on our job opportunities via talent@zetpy.com or +6010-290 0930",
            },
          ],
        },
      ],
      [utils.asGridCoords(7, 3)]: [
        {
          events: [
            // Devance Academy event
            {
              who: "hero",
              type: "stand",
              direction: "left",
            },
            {
              type: "textMessage",
              text: "Hi! Welcome to the Devance Academy Virtual Booth!",
            },
            {
              type: "textMessage",
              text: "Devance Academy was founded in 2020 and we are a community-centric academy that partners with employers to co-create upskilling and placement programs for digital talents.",
            },
            {
              type: "textMessage",
              text: "Our mission is to empower local talents to be gainfully employed while helping them develop world-class technology skill sets to compete globally.",
            },
            {
              type: "textMessage",
              text: "Our flagship program: Programmer Study Group, is a 1-month coaching program focused on upskilling CS/IT fresh graduates and preparing them for junior programmer roles in tech companies. In the past, we’ve organized programs for Digital Product Designer, WordPress and Blockchain Developer.",
            },
            {
              type: "textMessage",
              text: "We are dedicated to growing a community of digital talents throughout ASEAN, we believe in helping digital talents to uplift each other in the tech ecosystem and to compete globally.",
            },
            {
              type: "textMessage",
              text: "We are actively engaging and building the digital talents community via activities like peer coaching community for CTOs and Tech leads, hackathons, developers networking events and coding workshops.",
            },
            {
              type: "textMessage",
              text: "Please contact us for any info on our job opportunities via hello@devance.academy or +6011-54019188",
            },
          ],
        },
      ],
      [utils.asGridCoords(8, 3)]: [
        {
          events: [
            // Printcious event
            {
              who: "hero",
              type: "stand",
              direction: "right",
            },
            {
              type: "textMessage",
              text: "Hi! Welcome to the Printcious Virtual Booth!",
            },
            {
              type: "textMessage",
              text: "Printcious is an e-commerce website specialising in personalised gifts in which anybody can design their own gifts with our easy-to-use online design tools and get a unique gift for themselves and their loved ones.",
            },
            {
              type: "textMessage",
              text: "It's not just about a gift but, it is the gift that was made right from the bottom of their heart with a personal and DIY touch to it.",
            },
            {
              type: "textMessage",
              text: "Our personalised products include t-shirts, canvases, mugs, cushions, puzzles and many more. Enjoy customising your gifts with us.",
            },
            {
              type: "textMessage",
              text: "Please contact us for any info on our job opportunities via henry@printcious.com.",
            },
          ],
        },
      ],
    },
  },
};
