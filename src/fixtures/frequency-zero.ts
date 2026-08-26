export const FREQUENCY_ZERO_SCRIPT = `TITLE: FREQUENCY ZERO
FORMAT: Short Film (12 Pages)
AUTHOR: Zaeem Khan

SCENE 1
INT. K-DESERT BROADCAST BOOTH - NIGHT [1 4/8 PAGES]
A smoke-hazed 1970s radio studio lost in the Nevada expanse. Amber VU meters dance to silence. 
JACK (50s, bloodshot eyes, unlit cigarette behind his ear) leans into an RCA ribbon microphone.
MAYA (20s, grease-smudged knuckles, headphones around her neck) watches through the glass from the master rack.

JACK
(into mic)
Three-fourteen in the morning, high desert. You're on Frequency Zero. If anybody's breathing out past Mile Marker 80... you're not alone.

Jack drops a needle onto a battered acetate record. A strange HIGH-FREQUENCY WHINE pierces the monitor speakers.

MAYA
Jack, cut the feed! That signal isn't coming from our relay tower.

JACK
Where's it pulling from, Maya?

MAYA
(checking oscilloscope)
It's bouncing off the ionosphere... but the time-code header is stamped twenty-four hours ahead. Tomorrow night.

SCENE 2
INT. TRANSMITTER ROOM - NIGHT [6/8 PAGES]
Maya wrenches open the heavy steel cage of the 50,000-watt tube transmitter.
A glass vacuum tube glows violently violet. PRACTICAL SFX: sparks spit from the transformer coil with a heavy acrid plume of gray SMOKE.

MAYA
(coughing)
The modulation transformer is overloading! Kill the mains!

Jack grabs a fire extinguisher and blasts the base of the coil. The sparking dies down to a low pulsing hum.

SCENE 3
EXT. TRANSMITTER TOWER - NIGHT [4/8 PAGES]
Jack steps out onto the desert gravel beneath the three-hundred-foot red-and-white steel mast. Wind howls through the guy-wires.
Jack holds a portable battery receiver. Through the static, a crystal-clear broadcast crackles:

AUDIO FROM FUTURE (V.O.)
"At 04:15 AM, the Black Rock Canyon trestle gave way under Freight Hauler 9. Driver Jack Mercer was pronounced dead on scene."

Jack freezes. The voice on the future radio is his own.

SCENE 4
INT. K-DESERT BROADCAST BOOTH - DAWN [4/8 PAGES]
Golden morning sunlight cuts through dusty venetian blinds.
DEPUTY REYES (40s, dust-caked sheriff uniform) sips stale black coffee across the console from Jack.

REYES
You called me out to the flats at dawn because of a ghost broadcast, Jack?

JACK
It wasn't a ghost, Reyes. It was a weather-band carrier wave transmitting tomorrow's emergency bulletin.

MAYA
Deputy, the bridge structural sensor frequencies match our carrier harmonics. If the heavy rig crosses tonight during the storm, the center span buckles.

SCENE 5
INT. K-DESERT BROADCAST BOOTH - DAY [1 2/8 PAGES]
High noon heat shimmer outside the double-paned window.
Maya solders a military-surplus frequency transceiver to the master board.
Jack circles the room with a grease pencil, mapping the truck haul route across a topographical state map on the wall.

JACK
Rig 9 leaves the lithium refinery at midnight. If they take Highway 64, they hit the gorge at 4:10. We have four hours to verify the trestle foundation.

MAYA
Console is locked to the emergency bypass frequency. If we boost transmitter gain, we can reach the rig's CB radio directly.

SCENE 6
EXT. DESERT HIGHWAY 64 - DAY [1 0/8 PAGES]
Jack's battered 1978 CHEVY BLAZER kicks up rooster tails of alkali dust along the two-lane asphalt.
TWO HIGHWAY CREW WORKERS in high-vis vests set up detour cones near Mile Marker 82.
Jack pulls over and hops out.

JACK
(to road crew)
Is County inspecting the canyon bridge deck today?

HIGHWAY WORKER
Scheduled for next Tuesday, mister. Road's clear till midnight.

SCENE 7
EXT. CANYON OVERLOOK - DUSK [4/8 PAGES]
Deep purple twilight blankets the jagged red-rock gorge.
Jack stands on the precipice with high-powered binoculars trained on the ancient wooden-and-iron railway-converted bridge span.
Through the glass: two primary steel rivets have sheared cleanly off the south pier. The iron truss sags by two inches.

JACK
(into two-way radio)
Maya, the south footing is already failing. One forty-ton semi will pancake the whole span.

MAYA (RADIO V.O.)
Storm cell just crossed the Ridge, Jack. The rig is already rolling.

SCENE 8
EXT. CANYON BRIDGE - NIGHT [1 6/8 PAGES]
Torrential desert rain hammers the rotting timbers. Thunder shakes the canyon walls.
High-beam headlights of an eighteen-wheeler roar down the highway incline toward the bridge.
Jack runs onto the rain-slick approach waving a red magnesium emergency flare.
PRACTICAL SFX: The approaching truck lays on its air horn, tires locking and screeching against the wet pavement.
STUNT BEAT: Jack DIVES ACROSS THE GUARDRAIL onto the gravel bank as the heavy cab skids sideways, coming to a halt six feet from the severed bridge abyss.
Jack hits the rocky slope hard, sustaining a bloody gash across his forehead.

SCENE 9
INT. K-DESERT BROADCAST BOOTH - NIGHT [1 0/8 PAGES]
Jack stumbles back into the warm glow of the studio, soaked in rain, a white bandage taped over his bleeding temple.
Maya looks up from the master rack, tears in her eyes.
On the radio console, the oscilloscope line flattens into a steady, peaceful green wave.

JACK
(into microphone)
To anyone listening out there in the dark... the road is closed. Take the long way home tonight.

SCENE 10
EXT. RADIO STATION LOT - DAWN [4/8 PAGES]
Pink and gold desert sunrise rises over the radio tower.
Jack and Maya sit on the tailgate of the Blazer, drinking coffee from a shared thermos as the transmitter hums steadily into the new day.
`;

export const FREQUENCY_ZERO_PARSED = {
  title: "FREQUENCY ZERO",
  format: "short" as const,
  logline: "When an isolated graveyard-shift desert radio DJ intercepts an impossible broadcast from 24 hours in the future predicting a fatal highway collapse, he must risk everything on live air to stop an oncoming night freight convoy.",
  scenes: [
    {
      id: 1,
      slugline: "INT. K-DESERT BROADCAST BOOTH - NIGHT",
      intExt: "INT" as const,
      location: "K-DESERT BROADCAST BOOTH",
      timeOfDay: "NIGHT" as const,
      summary: "DJ Jack Mercer hosts his late-night broadcast when engineer Maya detects an impossible future-dated audio broadcast bouncing off the ionosphere.",
      characters: ["JACK", "MAYA"],
      pageEighths: 12, // 1 4/8 pages = 12 eighths
    },
    {
      id: 2,
      slugline: "INT. TRANSMITTER ROOM - NIGHT",
      intExt: "INT" as const,
      location: "TRANSMITTER ROOM",
      timeOfDay: "NIGHT" as const,
      summary: "Maya and Jack battle a sparking, smoking 50k-watt transmitter coil that threatens to ignite the station.",
      characters: ["JACK", "MAYA"],
      pageEighths: 6,
    },
    {
      id: 3,
      slugline: "EXT. TRANSMITTER TOWER - NIGHT",
      intExt: "EXT" as const,
      location: "TRANSMITTER TOWER",
      timeOfDay: "NIGHT" as const,
      summary: "Jack steps beneath the tower in the howling wind and hears his own voice reporting his death on tomorrow's broadcast.",
      characters: ["JACK"],
      pageEighths: 4,
    },
    {
      id: 4,
      slugline: "INT. K-DESERT BROADCAST BOOTH - DAWN",
      intExt: "INT" as const,
      location: "K-DESERT BROADCAST BOOTH",
      timeOfDay: "DAWN" as const,
      summary: "Jack and Maya explain the prophetic broadcast to a skeptical Deputy Reyes at first light.",
      characters: ["JACK", "MAYA", "DEPUTY REYES"],
      pageEighths: 4,
    },
    {
      id: 5,
      slugline: "INT. K-DESERT BROADCAST BOOTH - DAY",
      intExt: "INT" as const,
      location: "K-DESERT BROADCAST BOOTH",
      timeOfDay: "DAY" as const,
      summary: "Maya rigs emergency transmitter frequencies while Jack plots the doomed freight truck's route on a map.",
      characters: ["JACK", "MAYA"],
      pageEighths: 10,
    },
    {
      id: 6,
      slugline: "EXT. DESERT HIGHWAY 64 - DAY",
      intExt: "EXT" as const,
      location: "DESERT HIGHWAY 64",
      timeOfDay: "DAY" as const,
      summary: "Jack drives to the highway checkpoint and learns from road workers that bridge inspections were postponed.",
      characters: ["JACK"],
      pageEighths: 8,
    },
    {
      id: 7,
      slugline: "EXT. CANYON OVERLOOK - DUSK",
      intExt: "EXT" as const,
      location: "CANYON OVERLOOK",
      timeOfDay: "DUSK" as const,
      summary: "At dusk, Jack discovers sheared structural rivets on the canyon bridge span and radios Maya as the storm hits.",
      characters: ["JACK"],
      pageEighths: 4,
    },
    {
      id: 8,
      slugline: "EXT. CANYON BRIDGE - NIGHT",
      intExt: "EXT" as const,
      location: "CANYON BRIDGE",
      timeOfDay: "NIGHT" as const,
      summary: "In a raging rainstorm, Jack flags down the runaway freight truck with a flare and dives across the guardrail to survive the skid.",
      characters: ["JACK"],
      pageEighths: 14,
    },
    {
      id: 9,
      slugline: "INT. K-DESERT BROADCAST BOOTH - NIGHT",
      intExt: "INT" as const,
      location: "K-DESERT BROADCAST BOOTH",
      timeOfDay: "NIGHT" as const,
      summary: "An injured, bandaged Jack returns to the microphone to close the broadcast as the future timeline resets.",
      characters: ["JACK", "MAYA"],
      pageEighths: 8,
    },
    {
      id: 10,
      slugline: "EXT. RADIO STATION LOT - DAWN",
      intExt: "EXT" as const,
      location: "RADIO STATION LOT",
      timeOfDay: "DAWN" as const,
      summary: "Jack and Maya share coffee on the truck tailgate at sunrise as the station broadcasts into a peaceful new morning.",
      characters: ["JACK", "MAYA"],
      pageEighths: 4,
    },
  ],
};
