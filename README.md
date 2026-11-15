# Lunar Frontier Mission Trainer

An interactive educational lunar-outpost mission simulator developed for the **2026 NASA Space Apps Challenge**.

**Challenge:** Build a Junior Astronaut Mission Trainer

## Project Links

**Live Demo:** https://lunar-frontier-mission-trainer.vercel.app/

**Source Code:** https://github.com/Zohra359/lunar-frontier-mission-trainer

## Project Overview

Lunar Frontier is an educational mission-management game that places players in command of a lunar outpost. Players must make operational decisions, manage limited resources, respond to mission challenges and protect their crew throughout a 30-day mission.

The project explores the interconnected challenges of establishing a sustainable human presence on the Moon. It turns these challenges into a decision-based simulation in which resource management, crew welfare and mission priorities influence the outcome.

## The Challenge

A lunar outpost operates in an environment very different from Earth. Astronauts must contend with limited supplies, extreme temperatures, radiation exposure, lunar dust and dependence on reliable power and life-support systems.

These challenges are interconnected. A decision that benefits one system may create pressure elsewhere. Mission commanders must therefore consider both immediate needs and long-term consequences.

## Our Solution

Lunar Frontier provides an interactive environment in which players experience these trade-offs through a simulated lunar mission.

Players can:

- Review the mission briefing and learn about lunar operating conditions.
- Explore the Astronaut Academy and its educational modules.
- Monitor essential outpost resources and crew conditions.
- Make daily operational and crew-management decisions.
- Resolve mission days and respond to changing conditions.
- Review the mission outcome through a debrief report.

## Main Features

### Mission Briefing

Introduces the mission objectives, survival priorities and environmental challenges facing the lunar outpost.

### Astronaut Academy

Provides introductory learning modules covering:

- Life-support systems
- Power and energy
- Radiation protection
- Lunar dust and terrain
- Thermal control
- Mission resource management

### Mission Control

The central interactive simulation. Players monitor resource levels, review mission alerts and make decisions about outpost operations, crew priorities, field work, greenhouse activity and emergency reserves.

### Mission Simulation

A deterministic simulation engine processes player decisions and updates mission conditions. Resource management and crew welfare influence the progression and outcome of the mission.

### Mission Debrief

Presents a report after the mission reaches a victory or failure outcome, allowing players to review their performance.

## How to Play

1. Open the live demo.
2. Read the Mission Briefing.
3. Explore the Astronaut Academy to understand the challenges.
4. Enter Mission Control and begin the mission.
5. Monitor resources, alerts and crew conditions.
6. Select daily decisions and resolve each mission day.
7. Adapt your strategy as mission conditions change.
8. Review your final mission debrief.

## Scientific Basis and Limitations

The project uses established information about the lunar environment to introduce realistic mission-planning challenges.

Scientific background references include NASA's Moon Fact Sheet, historical Apollo radiation records and published measurements from the Artemis I lunar mission.

The simulation is an educational model, not a validated lunar engineering system. Resource consumption, crew conditions, radiation protection and mission events are represented through simplified game assumptions. The simulation does not reproduce the full physical, biological or engineering complexity of a real lunar habitat.

Radiation measurements must be interpreted in their specific measurement context. Measurements taken inside a spacecraft or behind shielding are not interchangeable with measurements on the lunar surface or direct astronaut exposure.

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- JavaScript-based simulation logic

## Running the Project Locally

### Requirements

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/Zohra359/lunar-frontier-mission-trainer.git
```

Move into the project directory:

```bash
cd lunar-frontier-mission-trainer
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Production Build

To create and verify a production build:

```bash
npm run build
```

To run the production server locally:

```bash
npm run start
```

## Project Structure

```text
lunar-frontier-mission-trainer/
│
├── public/
├── src/
│   ├── app/
│   │   ├── academy/
│   │   ├── briefing/
│   │   ├── debrief/
│   │   └── mission-control/
│   ├── components/
│   ├── config/
│   ├── game/
│   └── hooks/
│
├── package.json
├── next.config.ts
└── README.md
```

## Testing and Validation

The project was developed and tested through local development and production-build checks.

Validation included:

- Successful Next.js production builds.
- TypeScript checks during production builds.
- Navigation across the main application pages.
- Mission progression and resource-management logic.
- Daily decision handling and mission outcomes.
- Mission debrief generation.

## Scientific References

1. NASA National Space Science Data Center. *Moon Fact Sheet.*  
   https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html

2. NASA Apollo Lunar Surface Journal. *Working on the Moon: Radiation Environment.*  
   https://history.nasa.gov/wp-content/uploads/static/history/alsj/WOTM/WOTM-Radiation.html

3. George, S. P., et al. (2024). *Space radiation measurements during the Artemis I lunar mission.* Nature, 634, 48–52.  
   https://doi.org/10.1038/s41586-024-07927-7

4. NASA Space Apps Challenge 2026. *Build a Junior Astronaut Mission Trainer.*  
   https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/

## AI Tools and Acknowledgements

ChatGPT was used to support project planning, code generation and revision, implementation review, debugging, simulation-logic improvements, scientific explanations and documentation.

Manas AI has been used to support the development of the project's seven-slide presentation.

All scientific references and simplified simulation assumptions should be interpreted within the educational scope of this project.

## Project Information

**Project:** Lunar Frontier Mission Trainer  
**Competition:** NASA Space Apps Challenge 2026  
**Challenge:** Build a Junior Astronaut Mission Trainer  
**Repository:** https://github.com/Zohra359/lunar-frontier-mission-trainer  
**Live Application:** https://lunar-frontier-mission-trainer.vercel.app/

## Disclaimer

Lunar Frontier is an independent educational project created for the NASA Space Apps Challenge 2026. It is not affiliated with, sponsored by or endorsed by NASA.

The simulation is intended for educational purposes. Its resource values, mission events and projections are simplified assumptions and should not be used as real-world astronaut training procedures or engineering specifications.