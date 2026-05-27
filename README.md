# Ratmalana Tourist Planner

Local Tourist Day-Visit Planner and Information System
This is a web application to plan one-day trips around Ratmalana.

Sri Lanka has many tourist attractions that are not properly organized or well documented online, especially at local level. Tourists and local travelers often struggle to find reliable and centralized information when planning short trips. Information such as travel distance, opening hours, nearby attractions, and route planning is usually scattered across multiple sources.

This project was developed as a web-based Local Tourist Day-Visit Planner and Information System focused on attractions within a 25 km radius of Ratmalana, Sri Lanka. Ratmalana was selected as the central locality because it is surrounded by a diverse range of destinations including beaches, religious places, heritage locations, museums, parks, wildlife attractions, and recreational areas.

The system specifically focuses on a 25 km radius to support practical one-day trip planning. The purpose of this limitation is to help users create realistic travel plans that can comfortably be completed within a single day without requiring hotel bookings, long-distance transportation, or overnight stays. This makes the application more suitable for students, families, local residents, budget travelers, and tourists looking for short and convenient travel experiences.

The application allows users to browse tourist destinations, filter locations by categories such as Nature, Religious, Heritage, Recreational, and Cultural attractions, and view important information including descriptions, travel distance, estimated travel time, and map locations.

The category system was designed to support different types of tourists and travel preferences:

Nature lovers can explore beaches, parks, and wildlife attractions
Cultural and heritage tourists can discover museums and historical locations
Religious visitors can find temples and spiritual places
Recreational travelers and families can identify relaxing and entertainment-focused destinations

The system also provides trip planning functionality where users can select multiple destinations, organize a one-day itinerary, and visualize selected places on an interactive map to improve trip organization and time management.

## Features

- View tourist places
- Plan trips
- Map integration (coming soon)

## Tech Stack

- Supabase(Database + Authentication + Backend )
- React (Vite)
- Tailwind CS
- HTML/CSS/JavaScript

## Progress

### Initial Setup

- Database created
- Setup React app with Vite
- Integrated with existing project
- Added database schema and seed files
- Configured Git and GitHub
- Installed Tailwind CSS

### Core UI & Data

- Built responsive UI for places
- Displaying places from database
- Implemented category filtering
- Started "Add to Plan" feature

### Trip Planning

- Completed "Add to Plan" functionality
- Implemented trip creation logic
- Saved trip plans to database (trips and trip_places)
- Linked trips to logged-in users
- Displayed saved trips with selected places in order

### Map Integration

- Integrated map to display places
- Displayed saved trips on map with markers

### Authentication & User System

- Implemented user signup, login, and logout using Supabase
- Created separate login and signup form components
- Linked authenticated users to profiles table
- Added username and role (admin/user)

### Access Control & Security

- Restricted features to authenticated users only
- Applied Row Level Security (RLS) on all tables
- Ensured users can only access their own trips and data

### Admin Management System

- Added admin dashboard for destination management
- Admin can add new tourist places
- Admin can edit existing place details
- Admin can delete destinations
- Restricted admin features based on user role

### UI / UX Improvements

- Added modern landing page with hero section
- Improved responsive layout for mobile and desktop
- Added featured destination cards
- Improved navigation header and footer
- Enhanced planner controls and category filters

### Trip Planner Enhancements

- Added custom starting location input
- Added departure time selection
- Added optional lunch break toggle
- Added trip distance and duration validation warnings
- Improved one-day itinerary generation flow

### Finalization & Deployment

- Fixed import and file structure issues
- Cleaned project components and folders
- Tested core system features
- Deployed project using Vercel
- Prepared final documentation and presentation

## Future Improvements

### Public Transport Integration

- Add bus and train transport options for route planning
- Allow users to plan trips based on preferred transportation methods

### Advanced Mapping APIs

- Integrate advanced services such as Google Maps API
- Improve route accuracy, traffic updates, and distance calculations

### Live Transport Tracking

- Add live tracking for buses and trains
- Provide real-time travel and transport information

### Island-wide Expansion

- Expand the system beyond Ratmalana
- Include tourist destinations across Sri Lanka

### Hidden Gems Submission Feature

- Allow users to suggest lesser-known tourist locations
- Admin can review and approve submitted destinations

### User Reviews and Ratings

- Add reviews and rating functionality
- Help users share experiences and recommend places

### Contact and User Feedback Section

- Add a dedicated feedback and support section
- Allow users to report incorrect information or technical issues

### Offline Navigation

- Add offline map and navigation support
- Improve usability in low internet connectivity areas

### Weather Updates

- Integrate live weather information
- Help users plan trips according to weather conditions

### Multi-language Support

- Add multiple language and translation support
- Improve accessibility for foreign tourists

### Multi-day Trip Planning

- Extend support beyond one-day visits
- Allow weekend and multi-day trip planning

### Improved Admin Analytics Dashboard

- Add analytics for popular destinations and user activity
- Provide better system monitoring for administrators

### Enhanced User Interface Design

- Improve the overall UI/UX design
- Add a more modern, professional, and user-friendly layout

## Current Status

✅ Project Completed  
✅ Ready for Final Submission
