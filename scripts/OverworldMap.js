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
    lowerSrc: "assets/map.png",
    upperSrc: "assets/mapUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(14),
        y: utils.withGrid(18),
      }),
      customerA: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(26),
        y: utils.withGrid(9),
        src: "assets/npc3.png",
        behaviorLoop: [{ type: "stand", direction: "down" }],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Player: Hello, what drink are you having?",
                faceHero: "customerA",
              },
              {
                type: "textMessage",
                text: "Customer: I’m having Teh Tarik, the most well-known Malaysian drink. I recommend you to try it!",
                faceHero: "customerA",
              },
              {
                type: "textMessage",
                text: "Player: What does Teh Tarik mean?",
                faceHero: "customerA",
              },
              {
                type: "textMessage",
                text: "Customer: Teh Tarik means ‘pulled tea’ as in order to prepare this drink, the tea has to be repeatedly poured from one cup to another. This will release the heat so that it is drinkable, and most importantly, it will create a thick, frothy top.",
                faceHero: "customerA",
              },
              {
                type: "textMessage",
                text: "Customer: As the tea is poured with increasing height, it gives the illusion of a long stream of tea being ‘pulled’ in mid-air, thus giving it its name.",
                faceHero: "customerA",
              },
              {
                type: "textMessage",
                text: "Player: I see, that’s really interesting to know! I will give it a try!",
                faceHero: "customerA",
              },
            ],
          },
        ],
      }),
      customerBLeft: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(2),
        y: utils.withGrid(14),
        src: "assets/npc3.png",
        behaviorLoop: [
          { type: "stand", direction: "down", time: 3600 },
          { type: "stand", direction: "right", time: 2400 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Customer: This Milo Dinosaur tastes so good!",
              },
              {
                type: "textMessage",
                text: "Customer: Have you ever tried Milo Dinosaur before? It’s basically Milo Ais with an added topping of Milo powder.",
                faceHero: "customerBLeft",
              },
              {
                type: "textMessage",
                text: "Player: Well, I have tried Milo Ais before but not Milo Dinosaur. I would like to find out if it tastes different from it…",
                faceHero: "customerBLeft",
              },
            ],
          },
        ],
      }),
      customerBRight: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(3),
        y: utils.withGrid(14),
        src: "assets/npc2.png",
        behaviorLoop: [
          { type: "stand", direction: "down", time: 4000 },
          { type: "stand", direction: "left", time: 2200 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Player: Hi, what does your drink taste like?",
              },
              {
                type: "textMessage",
                text: "Player: Hey there, Sirap Bandung is a mixture of rose syrup and condensed milk. Although it looks like strawberry milk, it tastes completely different from it. You should try it since it has a unique taste!",
                faceHero: "customerBRight",
              },
              {
                type: "textMessage",
                text: "Player: Cool, it does look very appealing!",
                faceHero: "customerBRight",
              },
            ],
          },
        ],
      }),
      customerC: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(16),
        y: utils.withGrid(9),
        src: "assets/npc3.png",
        behaviorLoop: [
          { type: "stand", direction: "down", time: 2400 },
          { type: "stand", direction: "left", time: 1200 },
          { type: "stand", direction: "down", time: 2400 },
          { type: "stand", direction: "right", time: 1200 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Customer: Hmm, I wonder if Cincau is available today?",
              },
              {
                type: "textMessage",
                text: "Player: Hello, Cincau is the grass jelly, right?",
              },
              {
                type: "textMessage",
                text: "Customer: Hey, yes, that’s right. It is a sweet dessert made of a type of plant called Mesona Chinensis which belongs to the mint family.",
                faceHero: "customerC",
              },
              {
                type: "textMessage",
                text: "Player: Wow, I didn’t know that. How is it made into a jelly then?",
                faceHero: "customerC",
              },
              {
                type: "textMessage",
                text: "Customer: The leaves and stalks of this plant are dried and boiled with a small amount of starch or rice flour. After cooling down, the liquid will firm into a jelly-like consistency.",
                faceHero: "customerC",
              },
              {
                type: "textMessage",
                text: "Player: That’s amazing! Is it a common food in Malaysia?",
                faceHero: "customerC",
              },
              {
                type: "textMessage",
                text: "Customer: Of course, although it originated from Hong Kong, Taiwan, and Southern China, it is often used as a topping for Malaysian desserts, or added to other beverages such as soy milk, iced teh tarik, and sirap bandung. Alternatively, it can be served on its own with some sugar syrup, as ‘iced cincau’. You can even find cincau drinks sold in cans in a vending machine.",
                faceHero: "customerC",
              },
              {
                type: "textMessage",
                text: "Player: It sounds like a must-try drink! Thanks :)",
                faceHero: "customerC",
              },
              {
                type: "textMessage",
                text: "Customer: The leaves and stalks of this plant are dried and boiled with a small amount of starch or rice flour. After cooling down, the liquid will firm into a jelly-like consistency.",
                faceHero: "customerC",
              },
            ],
          },
        ],
      }),
      customerD: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(25),
        y: utils.withGrid(14),
        src: "assets/npc2.png",
        behaviorLoop: [{ type: "stand", direction: "down" }],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Player: Hello, what drink are you having?",
              },
              {
                type: "textMessage",
                text: "Customer: I’m having ‘Air Mata Kucing’",
                faceHero: "customerD",
              },
              {
                type: "textMessage",
                text: "Player: ‘Air Mata Kucing’? What could that mean as a drink?",
                faceHero: "customerD",
              },
              {
                type: "textMessage",
                text: "Customer: Haha, please do not think of images of cat eyes floating in the brown liquid. It is made up of monk fruit which is also known as “Lo Hon Guo'' in Chinese.",
                faceHero: "customerD",
              },
              {
                type: "textMessage",
                text: "Customer:  The abundant benefits of monk fruit are widely known in the world of traditional Chinese medicine.",
                faceHero: "customerD",
              },
              {
                type: "textMessage",
                text: "Player: What are the health benefits?",
                faceHero: "customerD",
              },
              {
                type: "textMessage",
                text: "Customer: Researchers claim that the fruit can help relieve depression, prevent cell damage, and act as an anti-ageing agent. This drink can be usually found at Petaling Street and night markets so I am surprised to see it being sold here.",
                faceHero: "customerD",
              },
              {
                type: "textMessage",
                text: "Customer: Moreover, Air Mata Kucing was also ranked #6 out of the “50 Most Delicious Drinks from Around the World” by CNN.",
                faceHero: "customerD",
              },
              {
                type: "textMessage",
                text: "Player: Impressive! I wish I could try all the drinks here.",
                faceHero: "customerD",
              },
            ],
          },
        ],
      }),
      employeeE: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "assets/npc1.png",
        behaviorLoop: [
          { type: "stand", direction: "down", time: 3600 },
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "down", time: 3600 },
          { type: "stand", direction: "right", time: 800 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Employee: What drink would you want to order?",
                faceHero: "employeeE",
              },
              {
                type: "textMessage",
                text: "Player: What is the difference between Teh O and Teh?",
                faceHero: "employeeE",
              },
              {
                type: "textMessage",
                text: "Employee: Teh O is tea without any milk hence the O in its name that symbolizes zero meanwhile Teh is milk tea.",
                faceHero: "employeeE",
              },
              {
                type: "textMessage",
                text: "Player: Wow, that's interesting. Is it the same case with Kopi O?",
                faceHero: "employeeE",
              },
              {
                type: "textMessage",
                text: "Employee: Yup, now you know what the O in Malaysian drinks mean.",
                faceHero: "employeeE",
              },
              {
                type: "textMessage",
                text: "Player: That’s helpful. Next time I will not make a mistake while ordering local drinks.",
                faceHero: "employeeE",
              },
            ],
          },
        ],
      }),
      employeeH: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "assets/npc1.png",
        behaviorLoop: [
          { type: "stand", direction: "down", time: 3600 },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "stand", direction: "down", time: 2400 },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Player: Just asking, did Malaysia have any alcoholic local drinks?",
              },
              {
                type: "textMessage",
                text: "Employee: We do actually. Even though Malaysia is a muslim country, we have a variety of races and ethnicities that have their own culture.",
                faceHero: "employeeH",
              },
              {
                type: "textMessage",
                text: "Player: Great, can you tell me more about it?",
                faceHero: "employeeH",
              },
              {
                type: "textMessage",
                text: "Employee: Sure. For example, we have a drink called ‘Tuak’ which was invented by some of the native tribes in Sarawak on the island of Borneo.",
                faceHero: "employeeH",
              },
              {
                type: "textMessage",
                text: "Player: What is a 'Tuak'",
                faceHero: "employeeH",
              },
              {
                type: "textMessage",
                text: "Employee: ‘Tuak’ is a rice wine that is made of four basic ingredients, which is cooked glutinous rice, ragi(a traditional starter base containing bacterial enzymes and yeast), water and sugar which is optional. Some ‘Tuak’ also may include honey to give it a mead-like flavor.",
                faceHero: "employeeH",
              },
              {
                type: "textMessage",
                text: "Player: Cheers.",
                faceHero: "employeeH",
              },
            ],
          },
        ],
      }),
      employeeG: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(15),
        y: utils.withGrid(5),
        src: "assets/npc1.png",
        behaviorLoop: [
          { type: "stand", direction: "down", time: 1200 },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "stand", direction: "down", time: 6000 },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Player: Did Malaysia have any caffeinated local drinks like coffee? I need something to juice up my day.",
              },
              {
                type: "textMessage",
                text: "Employee: We do actually have white coffee.",
                faceHero: "employeeG",
              },
              {
                type: "textMessage",
                text: "Player: Wow, is that like a latte or something?",
                faceHero: "employeeG",
              },
              {
                type: "textMessage",
                text: "Employee: No, it’s different. The word ‘white’ in white coffee means unadulterated or pure. This refers to the brewing process, in which the coffee beans are brewed without any added substances or ingredients.",
                faceHero: "employeeG",
              },
              {
                type: "textMessage",
                text: "Employee: While other types of coffee are roasted with sugars, margarine and wheat, white coffee is only roasted with margarine only giving the coffee a lighter color.",
                faceHero: "employeeG",
              },
              {
                type: "textMessage",
                text: "Player: Gimme some so I can get through this Monday blues.",
                faceHero: "employeeG",
              },
            ],
          },
        ],
      }),
      employeeF: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(17),
        y: utils.withGrid(4),
        src: "assets/npc1.png",
        behaviorLoop: [{ type: "stand", direction: "right" }],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Player: What drinks are you making?",
              },
              {
                type: "textMessage",
                text: "Employee: I'm currently making barley juice.",
                faceHero: "employeeF",
              },
              {
                type: "textMessage",
                text: "Player: Barley juice? Who would have thought that barley could be served as a juice?",
                faceHero: "employeeF",
              },
              {
                type: "textMessage",
                text: "Employee: Well if you could make stout out of it, why not make a juice too? but this barley drink didn't taste anything like its alcoholic counterpart. It is sweet, slightly thick and comes with soft barley pearls and can be served warm or cold, plain or with lime.",
                faceHero: "employeeF",
              },
              {
                type: "textMessage",
                text: "Player: Does it have any benefits?",
                faceHero: "employeeF",
              },
              {
                type: "textMessage",
                text: "Employee: It is thought to have a cooling effect on the body and is often used as a home remedy for fever. Also, drinking barley water on a regular basis can help promote weight loss, and lower cholesterol and blood sugar levels.",
                faceHero: "employeeF",
              },
              {
                type: "textMessage",
                text: "Player: Cool (Pun intended), I would definitely try it in the future.",
                faceHero: "employeeF",
              },
            ],
          },
        ],
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
      [utils.asGridCoords(23, 4)]: true,
      [utils.asGridCoords(28, 4)]: true,
      [utils.asGridCoords(0, 5)]: true,
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
      [utils.asGridCoords(16, 9)]: true,
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
      [utils.asGridCoords(8, 14)]: true,
      [utils.asGridCoords(11, 14)]: true,
      [utils.asGridCoords(17, 14)]: true,
      [utils.asGridCoords(20, 14)]: true,
      [utils.asGridCoords(13, 19)]: true,
      [utils.asGridCoords(14, 19)]: true,
      [utils.asGridCoords(15, 19)]: true,
    },
  },
};
