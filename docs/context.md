You're building a small web-based comedy game called "Simulator Collection."

The game consists of three "simulators," each placing the player in control of an inanimate object that cannot move or interact with the world. The humor comes from the complete lack of gameplay combined with surprisingly high quality visuals, ambient audio, and a living environment.

The application opens to a simple menu containing Play, Settings, and Quit.

The Settings menu only contains a Graphics option (Low/High) and a Mode option (Realistic/Arcade). Selecting Arcade immediately displays a message explaining that the player is still an inanimate object and automatically switches back to Realistic mode.

Pressing Play opens a simulator selection screen with three choices:

• Coconut Simulator, set on a tropical beach.
• Bench Simulator, set in a lively city park.
• Jungle Idol Simulator, set in an ancient jungle temple.

Each simulator places the camera near the object while the object remains completely stationary for the entire experience.

The environments are the focus of the game. They include dynamic lighting, ambient sound, weather, NPCs, wildlife, and scripted background events that occur every few seconds. These events have no impact on the player and exist purely to make the world feel alive and create comedic moments.

Examples include crabs walking past the coconut, joggers using the park, explorers passing the jungle idol, changing weather, sunsets, birds flying overhead, and occasional extremely rare events such as a UFO or pirate ship.

A small overlay displays humorous information such as the object's status, movement, and current objective ("Continue Existing"). The experience has no win condition, no player movement, no inventory, and no objectives beyond existing as the chosen object.

The entire project runs client-side in the browser using React and Three.js with no backend.