#! /usr/bin/env node
"use strict";var express_=require("express"),cors_=require("cors"),cookieParser_=require("socket.io-cookie-parser"),path_=require("path"),socketio_=require("socket.io");class InvalidCommandError extends Error{constructor(){super("Invalid command")}}class CommandParser{constructor(){this.registeredCommands=[]}on(e,o,r,a){if(Array.isArray(o)){const s=o;this.registeredCommands.push({commandName:e,argumentsFormat:s,handler:r,errorHandler:a})}else{const a=o;this.registeredCommands.push({commandName:e,argumentsFormat:[],handler:a,errorHandler:r})}}parseCommand(e){for(const o of this.registeredCommands){const r=escapeRegExp(o.commandName),a=new Array(o.argumentsFormat.length).fill(void 0).map((e,r)=>"?"!==o.argumentsFormat[r].source.slice(-1)?"\\s+(.+)":"(?:\\s+(.+))?").join(""),s=new RegExp(`^\\\\${r}(?:${a})?\\s*$`);if(s.test(e)){const a=o.argumentsFormat.map(e=>"?"!==e.source.slice(-1)?`\\s+(${e.source})`:`(?:\\s+(${e.source.slice(0,-1)}))?`).join(""),n=new RegExp(`^\\\\${r}${a}\\s*$`);if(n.test(e)){const r=e.match(n).slice(1);o.handler(...r)}else{if(!o.errorHandler)throw new InvalidCommandError;{const r=e.match(s).slice(1);o.errorHandler(...r)}}return}}throw new InvalidCommandError}}function escapeRegExp(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function b(e,...o){return htmlElement("b",e,...o)}function span(e,...o){return htmlElement("span",e,...o)}function ul(e,...o){return htmlElement("ul",e,...o)}function li(e,...o){return htmlElement("li",e,...o)}function div(e,...o){return htmlElement("div",e,...o)}function htmlElement(e,o,...r){return`<${e} style="${Object.entries(o).map(([e,o])=>`${e}: ${o};`).join("")}">${r.join("")}</${e}>`}class Message{constructor(e,o,r=new Date){this.content=e,this.user=o,this.timestamp=r}}class AnonymousMessage extends Message{constructor(e){super(e,null,null)}}function pickRandom(e){return e[Math.floor(Math.random()*e.length)]}class User{static fromJSON(e){try{return JSON.parse(e)}catch(e){return}}constructor(){this.name=this.generateRandomUsername(),this.color=this.generateRandomColorForWhiteBackground()}generateRandomUsername(){return`${pickRandom(listOfCodingAdjectives)} ${pickRandom(listOfAnimalNames)}`}generateRandomColorForWhiteBackground(){return`hsl(${360*Math.random()}, 95%, 40%)`}}const listOfCodingAdjectives=["Actual","Additional","Axial","Binary","Common","Complete","Complex","Cultural","Different","Efficient","Genetic","Good","Initial","Medical","New","Proper","Same","Selective","Simple","Specific","Standard","Stinky","Temporal"],listOfAnimalNames=["Aardvark","Abyssinian","Affenpinscher","Akbash","Akita","Albatross","Alligator","Alpaca","Angelfish","Ant","Anteater","Antelope","Ape","Armadillo","Ass","Avocet","Axolotl","Baboon","Badger","Balinese","Bandicoot","Barb","Barnacle","Baring","Barracuda","Bat","Beagle","Bear","Beaver","Bee","Beetle","Binturong","Bird","Birman","Bison","Bloodhound","Boar","Bobcat","Bombay","Bongo","Bonobo","Booby","Budgerigar","Buffalo","Bulldog","Bullfrog","Burmese","Butterfly","Caiman","Camel","Capybara","Caracal","Caribou","Cassowary","Cat","Caterpillar","Catfish","Cattle","Centipede","Chameleon","Chamois","Cheetah","Chicken","Chihuahua","Chimpanzee","Chinchilla","Chinook","Chipmunk","Chough","Cichlid","Clam","Coati","Cobra","Cockroach","Cod","Collie","Coral","Cormorant","Cougar","Cow","Coyote","Crab","Crane","Crocodile","Crow","Curlew","Cuscus","Cuttlefish","Dachshund","Dalmatian","Deer","Dhole","Dingo","Dinosaur","Discus","Dodo","Dog","Dogfish","Dolphin","Donkey","Dormouse","Dotterel","Dove","Dragonfly","Drever","Duck","Dugong","Dunker","Dunlin","Eagle","Earwig","Echidna","Eel","Eland","Elephant","Elephant seal","Elk","Emu","Falcon","Ferret","Finch","Fish","Flamingo","Flounder","Fly","Fossa","Fox","Frigatebird","Frog","Galago","Gar","Gaur","Gazelle","Gecko","Gerbil","Gharial","Giant Panda","Gibbon","Giraffe","Gnat","Gnu","Goat","Goldfinch","Goldfish","Goose","Gopher","Gorilla","Goshawk","Grasshopper","Greyhound","Grouse","Guanaco","Guinea fowl","Guinea pig","Gull","Guppy","Hamster","Hare","Harrier","Havanese","Hawk","Hedgehog","Heron","Herring","Himalayan","Hippopotamus","Hornet","Horse","Human","Hummingbird","Hyena","Ibis","Iguana","Impala","Indri","Insect","Jackal","Jaguar","Javanese","Jay","Jay"," Blue","Jellyfish","Kakapo","Kangaroo","Kingfisher","Kiwi","Koala","Komodo dragon","Kouprey","Kudu","Labradoodle","Ladybird","Lapwing","Lark","Lemming","Lemur","Leopard","Liger","Lion","Lionfish","Lizard","Llama","Lobster","Locust","Loris","Louse","Lynx","Lyrebird","Macaw","Magpie","Mallard","Maltese","Manatee","Mandrill","Markhor","Marten","Mastiff","Mayfly","Meerkat","Millipede","Mink","Mole","Molly","Mongoose","Mongrel","Monkey","Moorhen","Moose","Mosquito","Moth","Mouse","Mule","Narwhal","Neanderthal","Newfoundland","Newt","Nightingale","Numbat","Ocelot","Octopus","Okapi","Olm","Opossum","Orang-utan","Oryx","Ostrich","Otter","Owl","Ox","Oyster","Pademelon","Panther","Parrot","Partridge","Peacock","Peafowl","Pekingese","Pelican","Penguin","Persian","Pheasant","Pig","Pigeon","Pika","Pike","Piranha","Platypus","Pointer","Pony","Poodle","Porcupine","Porpoise","Possum","Prairie Dog","Prawn","Puffin","Pug","Puma","Quail","Quelea","Quetzal","Quokka","Quoll","Rabbit","Raccoon","Ragdoll","Rail","Ram","Rat","Rattlesnake","Raven","Red deer","Red panda","Reindeer","Rhinoceros","Robin","Rook","Rottweiler","Ruff","Salamander","Salmon","Sand Dollar","Sandpiper","Saola","Sardine","Scorpion","Sea lion","Sea Urchin","Seahorse","Seal","Serval","Shark","Sheep","Shrew","Shrimp","Siamese","Siberian","Skunk","Sloth","Snail","Snake","Snowshoe","Somali","Sparrow","Spider","Sponge","Squid","Squirrel","Starfish","Starling","Stingray","Stinkbug","Stoat","Stork","Swallow","Swan","Tang","Tapir","Tarsier","Termite","Tetra","Tiffany","Tiger","Toad","Tortoise","Toucan","Tropicbird","Trout","Tuatara","Turkey","Turtle","Uakari","Uguisu","Umbrellabird","Vicuña","Viper","Vulture","Wallaby","Walrus","Warthog","Wasp","Water buffalo","Weasel","Whale","Whippet","Wildebeest","Wolf","Wolverine","Wombat","Woodcock","Woodlouse","Woodpecker","Worm","Wrasse","Wren","Yak","Zebra","Zebu","Zonkey","Zorse"];class SocketIOChatServer{constructor(e){this.io=e,this.running=!1,this.effects=["dance","flip"],this.effectCommandArgumentRegex=new RegExp(`${this.effects.join("|")}|random|stop`),this.userMap=new Map,this.messages=[]}start(){this.running||(this.setupSocketIOListeners(),this.running=!0)}setupSocketIOListeners(){this.io.on("connection",e=>{const o=User.fromJSON(e.request.cookies.user);if(o&&this.userMap.has(o.name)){const r=this.userMap.get(o.name);r.refCount+=1,this.onNewUserConnected(r.user,e)}else{const r=o||new User;this.userMap.set(r.name,{user:r,refCount:1}),this.io.emit("newUser",r),this.onNewUserConnected(r,e)}})}onNewUserConnected(e,o){const r=this.getCommandParserForUser(e,o);o.emit("setUser",e),o.emit("listUsers",this.users),o.emit("listMessages",this.messages),o.emit("newMessage",new AnonymousMessage(`You are ${boldColoredUserName(e)}.`)),o.on("sendMessage",o=>{try{r.parseCommand(o)}catch(r){if(!(r instanceof InvalidCommandError))throw r;{const r=new Message(o,e);this.broadcastChatMessage(r)}}}),o.on("disconnect",()=>{this.onUserLeave(e)})}getCommandParserForUser(e,o){const r=new CommandParser;return r.on("help",()=>{this.sendHelpMessageToClient(o)}),r.on("nick",[/.*?/],r=>{this.setUserNickName(e,o,r)}),r.on("nickcolor",[/(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})?/],o=>{this.setUserColor(e,o)},e=>{this.sendErrorMessageToUser(o,`\\nickcolor ${e} - '${e}' is not a valid three or six digit hexadecimal color.`)}),r.on("effect",[this.effectCommandArgumentRegex],e=>{"random"===e&&(e=pickRandom(this.effects)),this.io.emit("effect",e)},e=>{const r=e?`\\effect ${e}`:"\\effect";this.sendErrorMessageToUser(o,`${r} - effect must be one of ${this.effects.join(", ")} random, or stop.`)}),r}broadcastChatMessage(e){this.messages.push(e),this.io.emit("newMessage",e)}onUserLeave(e){const o=this.userMap.get(e.name);1===o.refCount?(this.userMap.delete(e.name),this.io.emit("removeUser",e)):(o.refCount-=1,this.userMap.set(e.name,o))}sendHelpMessageToClient(e){e.emit("newMessage",new AnonymousMessage(span({},b({},"List of available commands:"),ul({},li({},b({},"\\help"),div({},"- prints this help message")),li({},b({},"\\nick [nickname]"),div({},"- change your nickname to ",b({},"[nickname]")," or leave empty for a new random nickname")),li({},b({},"\\nickcolor [",span({color:"red"},"RR"),span({color:"green"},"GG"),span({color:"blue"},"BB"),"] | [",span({color:"red"},"R"),span({color:"green"},"G"),span({color:"blue"},"B"),"]"),div({},"- change your nickname color to the specified hexadecimal color code or leave empty for a random color")),li({},b({},`\\effect ${this.effects.join(" | ")} | random`),div({},"- make all users screens perform the given effect")),li({},b({},"\\effect stop"),div({},"- stop effects started using the previous command"))))))}setUserNickName(e,o,r){if(e.name!==r){if(void 0===r)do{r=(new User).name}while(this.userMap.has(r));if(this.userMap.has(r))this.sendErrorMessageToUser(o,`\\nick ${r} - the nickname '${r}' is already taken.`);else{const o=e.name,a=this.userMap.get(o);this.userMap.delete(o),a.user.name=r,this.userMap.set(r,a),this.io.emit("updateUser",{target:o,updatedUser:a.user}),this.io.emit("newMessage",new AnonymousMessage(`${boldColoredText(o,a.user.color)} changed their nickname to ${boldColoredUserName(a.user)}.`))}}}setUserColor(e,o){o=void 0===o?(new User).color:"#"+o;const r=e.color;e.color=o,this.io.emit("updateUser",{target:e.name,updatedUser:e}),this.io.emit("newMessage",new AnonymousMessage(`${boldColoredUserName(e)} changed their color from ${boldColoredText("this",r)} to ${boldColoredText("this",e.color)}.`))}sendErrorMessageToUser(e,o){e.emit("newMessage",new AnonymousMessage(boldColoredText(`ERROR: ${o}`,"red")))}get users(){return Array.from(this.userMap.values()).map(e=>e.user)}}function boldColoredUserName(e){return boldColoredText(e.name,e.color)}function boldColoredText(e,o){return b({},span({color:o},e))}const express=express_,cors=cors_,cookieParser=cookieParser_,path=path_,socketio=socketio_,app=express(),http=require("http").Server(app),io=socketio(http),publicDir=path.join(__dirname,"../public");app.use(cors({origin:"http://localhost:4200",credentials:!0})),app.use("/",express.static(publicDir)),app.get("/",(e,o)=>{o.sendFile(path.join(publicDir,"index.html"))}),io.use(cookieParser());const chatServer=new SocketIOChatServer(io);chatServer.start(),http.listen(3e3,()=>{console.log("Server listening on port 3000")});