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
      [utils.asGridCoords(6, 2)]: true,
      [utils.asGridCoords(7, 2)]: true,
      [utils.asGridCoords(8, 2)]: true,
      [utils.asGridCoords(9, 2)]: true,
      [utils.asGridCoords(6, 3)]: true,
      [utils.asGridCoords(6, 4)]: true,
      [utils.asGridCoords(6, 5)]: true,
      [utils.asGridCoords(4, 5)]: true,
      [utils.asGridCoords(4, 6)]: true,
      [utils.asGridCoords(5, 5)]: true,
      [utils.asGridCoords(3, 6)]: true,
      [utils.asGridCoords(3, 7)]: true,
      [utils.asGridCoords(2, 8)]: true,
      [utils.asGridCoords(3, 9)]: true,
      [utils.asGridCoords(3, 10)]: true,
      [utils.asGridCoords(4, 10)]: true,
      [utils.asGridCoords(5, 10)]: true,
      [utils.asGridCoords(6, 10)]: true,
      [utils.asGridCoords(7, 10)]: true,
      [utils.asGridCoords(8, 10)]: true,
      [utils.asGridCoords(9, 10)]: true,
      [utils.asGridCoords(9, 9)]: true,
      [utils.asGridCoords(9, 8)]: true,
      [utils.asGridCoords(10, 8)]: true,
      [utils.asGridCoords(11, 7)]: true,
      [utils.asGridCoords(11, 8)]: true,
      [utils.asGridCoords(11, 9)]: true,
      [utils.asGridCoords(11, 10)]: true,
      [utils.asGridCoords(11, 11)]: true,
      [utils.asGridCoords(10, 11)]: true,
      [utils.asGridCoords(9, 11)]: true,
      [utils.asGridCoords(8, 11)]: true,
      [utils.asGridCoords(7, 11)]: true,
      [utils.asGridCoords(7, 12)]: true,
      [utils.asGridCoords(7, 13)]: true,
      [utils.asGridCoords(8, 13)]: true,
      [utils.asGridCoords(8, 12)]: true,
      [utils.asGridCoords(8, 14)]: true,
      [utils.asGridCoords(8, 15)]: true,
      [utils.asGridCoords(8, 16)]: true,
      [utils.asGridCoords(9, 16)]: true,
      [utils.asGridCoords(10, 16)]: true,
      [utils.asGridCoords(11, 15)]: true,
      [utils.asGridCoords(12, 16)]: true,
      [utils.asGridCoords(12, 17)]: true,
      [utils.asGridCoords(13, 17)]: true,
      [utils.asGridCoords(12, 15)]: true,
      [utils.asGridCoords(12, 14)]: true,
      [utils.asGridCoords(13, 14)]: true,
      [utils.asGridCoords(13, 15)]: true,
      [utils.asGridCoords(13, 18)]: true,
      [utils.asGridCoords(13, 19)]: true,
      [utils.asGridCoords(14, 19)]: true,
      [utils.asGridCoords(15, 19)]: true,
      [utils.asGridCoords(16, 19)]: true,
      [utils.asGridCoords(16, 18)]: true,
      [utils.asGridCoords(16, 17)]: true,
      [utils.asGridCoords(17, 17)]: true,
      [utils.asGridCoords(17, 16)]: true,
      [utils.asGridCoords(17, 15)]: true,
      [utils.asGridCoords(17, 14)]: true,
      [utils.asGridCoords(16, 14)]: true,
      [utils.asGridCoords(16, 15)]: true,
      [utils.asGridCoords(18, 16)]: true,
      [utils.asGridCoords(18, 15)]: true,
      [utils.asGridCoords(19, 15)]: true,
      [utils.asGridCoords(19, 16)]: true,
      [utils.asGridCoords(20, 16)]: true,
      [utils.asGridCoords(21, 16)]: true,
      [utils.asGridCoords(21, 15)]: true,
      [utils.asGridCoords(21, 14)]: true,
      [utils.asGridCoords(21, 13)]: true,
      [utils.asGridCoords(21, 12)]: true,
      [utils.asGridCoords(21, 11)]: true,
      [utils.asGridCoords(20, 11)]: true,
      [utils.asGridCoords(19, 11)]: true,
      [utils.asGridCoords(18, 11)]: true,
      [utils.asGridCoords(18, 10)]: true,
      [utils.asGridCoords(18, 9)]: true,
      [utils.asGridCoords(18, 8)]: true,
      [utils.asGridCoords(18, 7)]: true,
      [utils.asGridCoords(19, 7)]: true,
      [utils.asGridCoords(19, 8)]: true,
      [utils.asGridCoords(20, 8)]: true,
      [utils.asGridCoords(21, 8)]: true,
      [utils.asGridCoords(21, 9)]: true,
      [utils.asGridCoords(21, 10)]: true,
      [utils.asGridCoords(22, 10)]: true,
      [utils.asGridCoords(23, 10)]: true,
      [utils.asGridCoords(24, 10)]: true,
      [utils.asGridCoords(25, 10)]: true,
      [utils.asGridCoords(25, 9)]: true,
      [utils.asGridCoords(25, 8)]: true,
      [utils.asGridCoords(25, 7)]: true,
      [utils.asGridCoords(25, 6)]: true,
      [utils.asGridCoords(24, 6)]: true,
      [utils.asGridCoords(23, 6)]: true,
      [utils.asGridCoords(23, 5)]: true,
      [utils.asGridCoords(23, 4)]: true,
      [utils.asGridCoords(23, 3)]: true,
      [utils.asGridCoords(22, 3)]: true,
      [utils.asGridCoords(21, 3)]: true,
      [utils.asGridCoords(21, 4)]: true,
      [utils.asGridCoords(20, 3)]: true,
      [utils.asGridCoords(19, 3)]: true,
      [utils.asGridCoords(18, 3)]: true,
      [utils.asGridCoords(18, 4)]: true,
      [utils.asGridCoords(18, 5)]: true,
      [utils.asGridCoords(17, 5)]: true,
      [utils.asGridCoords(16, 5)]: true,
      [utils.asGridCoords(15, 5)]: true,
      [utils.asGridCoords(14, 5)]: true,
      [utils.asGridCoords(13, 5)]: true,
      [utils.asGridCoords(12, 5)]: true,
      [utils.asGridCoords(11, 5)]: true,
      [utils.asGridCoords(10, 5)]: true,
      [utils.asGridCoords(9, 5)]: true,
      [utils.asGridCoords(9, 4)]: true,
      [utils.asGridCoords(9, 3)]: true,
      [utils.asGridCoords(13, 8)]: true,
      [utils.asGridCoords(14, 8)]: true,
      [utils.asGridCoords(15, 8)]: true,
      [utils.asGridCoords(16, 8)]: true,
      [utils.asGridCoords(16, 9)]: true,
      [utils.asGridCoords(16, 10)]: true,
      [utils.asGridCoords(16, 11)]: true,
      [utils.asGridCoords(15, 11)]: true,
      [utils.asGridCoords(14, 11)]: true,
      [utils.asGridCoords(13, 11)]: true,
      [utils.asGridCoords(13, 10)]: true,
      [utils.asGridCoords(13, 9)]: true,
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
      [utils.asGridCoords(19, 4)]: [
        {
          events: [{ type: "changeMap", map: "secondFloor" }],
        },
      ],
      [utils.asGridCoords(20, 4)]: [
        {
          events: [{ type: "changeMap", map: "secondFloor" }],
        },
      ],
    },
  },

  secondFloor: {
    lowerSrc: "assets/floor2.png",
    upperSrc: "assets/mapUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(20),
        y: utils.withGrid(4),
      }),
      // person beside the escalator
      npc1: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(22),
        y: utils.withGrid(5),
        src: "assets/npc1.png",
        behaviorLoop: [{ type: "stand", direction: "left" }],
      }),
      // person at the chill zone (right)
      npc2: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(24),
        y: utils.withGrid(9),
        src: "assets/npc2.png",
        behaviorLoop: [{ type: "stand", direction: "right" }],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Hi there!",
                faceHero: "npc2",
              },
              {
                type: "textMessage",
                text: "Are you looking for a job too? Best of luck!",
                faceHero: "npc2",
              },
            ],
          },
        ],
      }),

      // middle counter
      npc3: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(18),
        y: utils.withGrid(13),
        src: "assets/npc3.png",
        behaviorLoop: [{ type: "stand", direction: "up" }],
      }),
      // top left counter 1 person
      npc4: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(12),
        y: utils.withGrid(4),
        src: "assets/npc2.png",
        behaviorLoop: [{ type: "stand", direction: "down" }],
      }),
      // top left counter 2 person
      npc5: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(6),
        y: utils.withGrid(4),
        src: "assets/npc3.png",
        behaviorLoop: [{ type: "stand", direction: "down" }],
      }),
      // bottom left room counter 1 person
      npc6: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(14),
        y: utils.withGrid(11),
        src: "assets/npc1.png",
        behaviorLoop: [{ type: "stand", direction: "left" }],
      }),
      // bottom left room counter 2 person
      npc7: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(6),
        y: utils.withGrid(15),
        src: "assets/npc3.png",
        behaviorLoop: [{ type: "stand", direction: "right" }],
      }),
      // bottom left room person
      npc8: new Person({
        isPlayerControlled: false,
        x: utils.withGrid(13),
        y: utils.withGrid(15),
        src: "assets/npc1.png",
        behaviorLoop: [{ type: "stand", direction: "left" }],
      }),
    },
    walls: {
      [utils.asGridCoords(3, 2)]: true,
      [utils.asGridCoords(3, 3)]: true,
      [utils.asGridCoords(3, 4)]: true,
      [utils.asGridCoords(3, 5)]: true,
      [utils.asGridCoords(3, 6)]: true,
      [utils.asGridCoords(3, 7)]: true,
      [utils.asGridCoords(3, 8)]: true,
      [utils.asGridCoords(4, 8)]: true,
      [utils.asGridCoords(4, 9)]: true,
      [utils.asGridCoords(4, 10)]: true,
      [utils.asGridCoords(4, 11)]: true,
      [utils.asGridCoords(4, 12)]: true,
      [utils.asGridCoords(5, 12)]: true,
      [utils.asGridCoords(6, 12)]: true,
      [utils.asGridCoords(7, 12)]: true,
      [utils.asGridCoords(5, 13)]: true,
      [utils.asGridCoords(6, 13)]: true,
      [utils.asGridCoords(7, 13)]: true,
      [utils.asGridCoords(7, 14)]: true,
      [utils.asGridCoords(7, 15)]: true,
      [utils.asGridCoords(7, 16)]: true,
      [utils.asGridCoords(7, 17)]: true,
      [utils.asGridCoords(8, 17)]: true,
      [utils.asGridCoords(9, 17)]: true,
      [utils.asGridCoords(10, 17)]: true,
      [utils.asGridCoords(11, 17)]: true,
      [utils.asGridCoords(12, 17)]: true,
      [utils.asGridCoords(13, 17)]: true,
      [utils.asGridCoords(14, 17)]: true,
      [utils.asGridCoords(14, 16)]: true,
      [utils.asGridCoords(14, 15)]: true,
      [utils.asGridCoords(14, 14)]: true,
      [utils.asGridCoords(15, 14)]: true,
      [utils.asGridCoords(15, 13)]: true,
      [utils.asGridCoords(15, 12)]: true,
      [utils.asGridCoords(15, 11)]: true,
      [utils.asGridCoords(15, 10)]: true,
      [utils.asGridCoords(15, 9)]: true,
      [utils.asGridCoords(15, 8)]: true,
      [utils.asGridCoords(12, 14)]: true,
      [utils.asGridCoords(13, 14)]: true,
      [utils.asGridCoords(12, 15)]: true,
      [utils.asGridCoords(12, 16)]: true,
      [utils.asGridCoords(8, 16)]: true,
      [utils.asGridCoords(9, 16)]: true,
      [utils.asGridCoords(10, 16)]: true,
      [utils.asGridCoords(11, 16)]: true,
      [utils.asGridCoords(13, 16)]: true,
      [utils.asGridCoords(13, 15)]: true,
      [utils.asGridCoords(14, 13)]: true,
      [utils.asGridCoords(14, 12)]: true,
      [utils.asGridCoords(13, 12)]: true,
      [utils.asGridCoords(13, 11)]: true,
      [utils.asGridCoords(13, 10)]: true,
      [utils.asGridCoords(13, 9)]: true,
      [utils.asGridCoords(13, 8)]: true,
      [utils.asGridCoords(14, 8)]: true,
      [utils.asGridCoords(12, 10)]: true,
      [utils.asGridCoords(11, 10)]: true,
      [utils.asGridCoords(10, 10)]: true,
      [utils.asGridCoords(10, 9)]: true,
      [utils.asGridCoords(9, 9)]: true,
      [utils.asGridCoords(8, 9)]: true,
      [utils.asGridCoords(7, 9)]: true,
      [utils.asGridCoords(7, 8)]: true,
      [utils.asGridCoords(8, 8)]: true,
      [utils.asGridCoords(9, 8)]: true,
      [utils.asGridCoords(10, 8)]: true,
      [utils.asGridCoords(11, 8)]: true,
      [utils.asGridCoords(12, 8)]: true,
      [utils.asGridCoords(16, 12)]: true,
      [utils.asGridCoords(17, 12)]: true,
      [utils.asGridCoords(18, 12)]: true,
      [utils.asGridCoords(19, 12)]: true,
      [utils.asGridCoords(20, 12)]: true,
      [utils.asGridCoords(19, 10)]: true,
      [utils.asGridCoords(20, 10)]: true,
      [utils.asGridCoords(19, 11)]: true,
      [utils.asGridCoords(20, 11)]: true,
      [utils.asGridCoords(20, 13)]: true,
      [utils.asGridCoords(21, 13)]: true,
      [utils.asGridCoords(22, 13)]: true,
      [utils.asGridCoords(23, 13)]: true,
      [utils.asGridCoords(24, 13)]: true,
      [utils.asGridCoords(25, 13)]: true,
      [utils.asGridCoords(26, 13)]: true,
      [utils.asGridCoords(27, 13)]: true,
      [utils.asGridCoords(25, 12)]: true,
      [utils.asGridCoords(26, 12)]: true,
      [utils.asGridCoords(27, 12)]: true,
      [utils.asGridCoords(27, 11)]: true,
      [utils.asGridCoords(27, 10)]: true,
      [utils.asGridCoords(27, 9)]: true,
      [utils.asGridCoords(27, 8)]: true,
      [utils.asGridCoords(22, 8)]: true,
      [utils.asGridCoords(22, 9)]: true,
      [utils.asGridCoords(22, 10)]: true,
      [utils.asGridCoords(22, 11)]: true,
      [utils.asGridCoords(23, 8)]: true,
      [utils.asGridCoords(23, 9)]: true,
      [utils.asGridCoords(23, 10)]: true,
      [utils.asGridCoords(23, 11)]: true,
      [utils.asGridCoords(24, 8)]: true,
      [utils.asGridCoords(27, 7)]: true,
      [utils.asGridCoords(26, 7)]: true,
      [utils.asGridCoords(25, 7)]: true,
      [utils.asGridCoords(24, 7)]: true,
      [utils.asGridCoords(23, 7)]: true,
      [utils.asGridCoords(22, 7)]: true,
      [utils.asGridCoords(21, 7)]: true,
      [utils.asGridCoords(21, 6)]: true,
      [utils.asGridCoords(21, 5)]: true,
      [utils.asGridCoords(21, 4)]: true,
      [utils.asGridCoords(21, 3)]: true,
      [utils.asGridCoords(20, 3)]: true,
      [utils.asGridCoords(19, 3)]: true,
      [utils.asGridCoords(18, 3)]: true,
      [utils.asGridCoords(18, 4)]: true,
      [utils.asGridCoords(18, 5)]: true,
      [utils.asGridCoords(17, 5)]: true,
      [utils.asGridCoords(16, 5)]: true,
      [utils.asGridCoords(15, 5)]: true,
      [utils.asGridCoords(14, 5)]: true,
      [utils.asGridCoords(13, 5)]: true,
      [utils.asGridCoords(12, 5)]: true,
      [utils.asGridCoords(11, 5)]: true,
      [utils.asGridCoords(10, 5)]: true,
      [utils.asGridCoords(9, 5)]: true,
      [utils.asGridCoords(8, 5)]: true,
      [utils.asGridCoords(7, 5)]: true,
      [utils.asGridCoords(6, 5)]: true,
      [utils.asGridCoords(5, 5)]: true,
      [utils.asGridCoords(4, 5)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoords(18, 11)]: [
        {
          events: [
            // event tile for MoneyLion
            {
              who: "hero",
              type: "stand",
              direction: "down",
            },
            {
              type: "textMessage",
              text: "Hi! Welcome to the MoneyLion Virtual Booth!",
            },
            {
              type: "textMessage",
              text: "MoneyLion is a mobile banking and financial membership platform that empowers people to take control of their finances. Our mission is to rewire the American banking system so that we can positively change the financial path for every hard-working American.",
            },
            {
              type: "textMessage",
              text: "Since our launch in 2013, we have engaged with 9.4 million hard-working Americans and have earned their trust by building a full-service digital platform to deliver mobile banking, lending, and investment solutions.",
            },
            {
              type: "textMessage",
              text: "The Kuala Lumpur office (MoneyLion Malaysia Sdn Bhd, or #kl-team) is considered the main technology hub of MoneyLion, recognising the sheer amount of engineering talent available in Malaysia.",
            },
            {
              type: "textMessage",
              text: "Currently, the Kuala Lumpur office houses the Engineering, Analytics, Information Technology, CyberSecurity, and Human Resource teams, playing a key part in empowering Americans towards better financial health.",
            },
            {
              type: "textMessage",
              text: "Please contact us for any info on our job opportunities via talent@moneylion.com or +60(3)-2276-3088.",
            },
          ],
        },
      ],
      [utils.asGridCoords(12, 6)]: [
        {
          events: [
            // event tile for Maxis
            {
              who: "hero",
              type: "stand",
              direction: "up",
            },
            {
              type: "textMessage",
              text: "Hi! Welcome to the Maxis Virtual Booth!",
            },
            {
              type: "textMessage",
              text: "As Malaysia's leading converged solutions provider, we are passionate about bringing together the best of technology to help people, businesses and the nation to Always Be Ahead in an evolving world. We deeply believe that the key element to our success has always been our employees.",
            },
            {
              type: "textMessage",
              text: "To realize our shared vision to become Malaysia's leading converged solutions company, we strongly believe in the empowerment of each employee in turning their ambitions into achievements through learning, career mobility and leadership.",
            },
            {
              type: "textMessage",
              text: "We thrive in inclusion, diversity and embrace close collaborations for them to create an impact for themselves and others.",
            },
            {
              type: "textMessage",
              text: "We embrace an innovative and digital mindset which our employees thrive on, helping them realize their potential and contribute their unique skills to create amazing products and services for our customers.",
            },
            {
              type: "textMessage",
              text: "Get Ahead in your career with Maxis. Please visit our official career website for any info on our job opportunities at https://www.maxis.com.my/en/about-maxis/career/ ",
            },
          ],
        },
      ],
      [utils.asGridCoords(6, 6)]: [
        {
          events: [
            // event tile for MRANTI
            {
              who: "hero",
              type: "stand",
              direction: "up",
            },
            {
              type: "textMessage",
              text: "Hi! Welcome to the MRANTI Virtual Booth!",
            },
            {
              type: "textMessage",
              text: "The Malaysian Research Accelerator for Technology and Innovation (MRANTI) is Malaysia’s central research commercialisation agency that fast-tracks the development of technology innovations from ideas to impact.",
            },
            {
              type: "textMessage",
              text: "MRANTI offers innovators and industry access to world-class integrated infrastructure, interventions & programmes, partnership and a suite of resources.",
            },
            {
              type: "textMessage",
              text: "In doing so, MRANTI aims to expand Malaysia’s funnel of innovation supply, and unlock new R&D value by ensuring effective transitions in the commercialisation lifecycle.",
            },
            {
              type: "textMessage",
              text: "It will also link academia with industry and the public sector to streamline market-driven R&D efforts for mission-based outcomes.",
            },
            {
              type: "textMessage",
              text: "Please contact us for any info on our job opportunities via hrmagic@mymagic.my or +603-89982020.",
            },
          ],
        },
      ],
      [utils.asGridCoords(12, 11)]: [
        {
          events: [
            // event tile for Nintex
            {
              who: "hero",
              type: "stand",
              direction: "right",
            },
            {
              type: "textMessage",
              text: "Hi! Welcome to the Nintex Virtual Booth!",
            },
            {
              type: "textMessage",
              text: "At Nintex, we build the industry’s best process management and automation capabilities to digitally transform a wide range of business processes.",
            },
            {
              type: "textMessage",
              text: "Our engineers help the biggest organizations including Microsoft, Amazon, and Zoom automate and create efficiency. Our engineers choose to work at Nintex because they are able to impact people all around the world from banking to manufacturing to education to e-commerce.",
            },
            {
              type: "textMessage",
              text: "Every employee that joins Nintex is presented with a massive market opportunity to help improve the way people work worldwide as every organization needs what we provide.",
            },
            {
              type: "textMessage",
              text: "Nintex has a long term vision to grown our own talent and create long and fulling careers at Nintex. As a Graduate Engineer you are high in potential and are at the start of your software engineering career. You will work with Senior Engineers as your mentors and get exposure to key area of the Engineering Team, such as software engineering, quality assurance and DevOps.",
            },
            {
              type: "textMessage",
              text: "Come GROW with us and fire-start your career! Please contact us for any info on our job opportunities via Melissa.lim@nintex.com or +60358797506.",
            },
          ],
        },
      ],
      [utils.asGridCoords(8, 15)]: [
        {
          events: [
            // event tile for Fusionex
            {
              who: "hero",
              type: "stand",
              direction: "left",
            },
            {
              type: "textMessage",
              text: "Hi! Welcome to the Fusionex Virtual Booth!",
            },
            {
              type: "textMessage",
              text: "Fusionex is an established multi-award-winning data technology provider specializing in Analytics, Big Data, Machine Learning and Artificial Intelligence.",
            },
            {
              type: "textMessage",
              text: "Our business is to help clients manage, make sense of and derive useful insights from the vast amounts of structured and unstructured data at their disposal.",
            },
            {
              type: "textMessage",
              text: "We are focused on bridging the gap between business and technology, and in doing so, provide exceptional and positive experiences to customers across various markets.",
            },
            {
              type: "textMessage",
              text: "Please contact us for any info on our job opportunities via chien.rou.lim@fusionexgroup.com.",
            },
          ],
        },
      ],
      [utils.asGridCoords(11, 15)]: [
        {
          events: [
            // event tile for Cyber Village
            {
              who: "hero",
              type: "stand",
              direction: "right",
            },
            {
              type: "textMessage",
              text: "Hi! Welcome to the Cyber Village Virtual Booth!",
            },
            {
              type: "textMessage",
              text: "We are the market leader in technology innovation focusing on digital engagement solutions for financial Institutions, insurTech and government agencies.",
            },
            {
              type: "textMessage",
              text: "Join us today to build and deliver enterprise sustainability application solution using market trend technology with easily scalable microservices and API architecture integrated to core and current systems,flexible digital payment, transfer, account management, and other banking functions, proven security compliance and Omni-channel solution regardless of device or operating system.",
            },
            {
              type: "textMessage",
              text: "We are looking for Software Engineer (JAVA) with experience in Digital Platform Enterprise Application for both Web and Mobile Application, Object-oriented design & development, Agile/scrum-based development model and JEE (Servlets, Spring, Hibernate)",
            },
            {
              type: "textMessage",
              text: "We are also looking for front-end developer with experience in HTML, JQuery, CSS, Ajax, JavaScript with Responsive framework such as Angular, React, NodeJS, Bootstrap, Ionic etc, graduates with experience in database such as DB2, Oracle, MSSQL, MySQL, and graduates with experience in web services such as REST/SOAP API, WSDL.",
            },
            {
              type: "textMessage",
              text: "We are looking for Software Engineer (JAVA) to build Digital Platform Enterprise Application for both Web and Mobile Application, Object-oriented design & development, Agile/scrum-based development model and JEE (Servlets, Spring, Hibernate)",
            },
            {
              type: "textMessage",
              text: "Interested to join us? Email your resume & transcript to recruit@cyber-village.net !",
            },
          ],
        },
      ],
      [utils.asGridCoords(19, 4)]: [
        {
          events: [{ type: "changeMap", map: "firstFloor" }],
        },
      ],
      [utils.asGridCoords(20, 4)]: [
        {
          events: [{ type: "changeMap", map: "firstFloor" }],
        },
      ],
    },
  },
};
