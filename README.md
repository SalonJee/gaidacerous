
# PetPal

PetPal is a digital pet simulator designed to create an emotional and interactive bond between users and their virtual pets. Similar to owning a real pet, users can take care of a digital companion, interact with it through different activities, and build a habit loop around pet care.

## Concept

Users begin by choosing a pet avatar, currently either a cat or a dog. Once selected, the app provides a virtual pet interface where users can interact with their companion in different ways.

For the hackathon prototype, we implemented a quick “Alert Button” toggle feature that acts as a simplified interaction system.

## Dynamic Digital Companion

The idea behind PetPal is that the pet evolves over time. During setup, users choose or upload profile-style avatar images for their pet. As time progresses, the application can update the pet’s appearance dynamically to reflect changes, moods, growth, or activity states.

This creates the feeling of a living digital companion rather than a static avatar.

## Habit Loop & User Engagement

Our core assumption is based on behavioral reinforcement:

When users feed or take care of their real pet, they are also encouraged to care for their digital companion inside the app.

This creates a parallel interaction loop where real-world pet care reinforces digital engagement. Over time, this can develop into a consistent habit loop and stronger emotional attachment to the application.

## Features

* Choose between a cat or dog companion
* Digital avatar-based pet system
* Interactive pet care experience
* Alert toggle system for quick interactions
* Time-based pet progression and avatar updates
* Clock and playful companion interactions
* Habit-building engagement model

## Business Model

PetPal can integrate pet-related product advertising and recommendations within the platform. For example:

* Catnip products
* Pet toys
* Pet food
* Accessories
* Other pet care items

This creates monetization opportunities while keeping recommendations relevant to pet owners.

## Vision

PetPal aims to blend emotional engagement, habit formation, and virtual companionship into a single experience that complements real-life pet ownership rather than replacing it.







---------TO SET  IT UP ---------------------------------------------------------------------------------------------------------------------------------------------------------

# Pet Twin Simulator (Expo)

Starter React Native Expo app for a pet simulator with:

- Dog or Cat selection
- Continuous time-based stat decay
- User actions: feed, water, play, give food
- Food safety risk impacting health
- Simple animated avatar behavior (first step before full 3D)

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start Expo:

```bash
npm run start
```

3. Open on your device using Expo Go or run Android/iOS simulator from the Expo UI.

## Notes

- Current avatar uses emoji + React Native animation.
- Next step for "Talking Tom style" is integrating a 3D character with `@react-three/fiber/native` and gesture/voice reactions.
