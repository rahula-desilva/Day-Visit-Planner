# Ratmalana Tourist Planner

This is a web application to plan one-day trips around Ratmalana.

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

* Database created
* Setup React app with Vite
* Integrated with existing project
* Added database schema and seed files
* Configured Git and GitHub
* Installed Tailwind CSS

### Core UI & Data

* Built responsive UI for places
* Displaying places from database
* Implemented category filtering
* Started "Add to Plan" feature

### Trip Planning

* Completed "Add to Plan" functionality
* Implemented trip creation logic
* Saved trip plans to database (trips and trip_places)
* Linked trips to logged-in users
* Displayed saved trips with selected places in order

### Map Integration

* Integrated map to display places
* Displayed saved trips on map with markers

### Authentication & User System

* Implemented user signup, login, and logout using Supabase
* Created separate login and signup form components
* Linked authenticated users to profiles table
* Added username and role (admin/user)

### Access Control & Security

* Restricted features to authenticated users only
* Applied Row Level Security (RLS) on all tables
* Ensured users can only access their own trips and data

### Admin Management System

* Added admin dashboard for destination management
* Admin can add new tourist places
* Admin can edit existing place details
* Admin can delete destinations
* Restricted admin features based on user role

### UI / UX Improvements

* Added modern landing page with hero section
* Improved responsive layout for mobile and desktop
* Added featured destination cards
* Improved navigation header and footer
* Enhanced planner controls and category filters

### Trip Planner Enhancements

* Added custom starting location input
* Added departure time selection
* Added optional lunch break toggle
* Added trip distance and duration validation warnings
* Improved one-day itinerary generation flow

### Finalization & Deployment

* Fixed import and file structure issues
* Cleaned project components and folders
* Tested core system features
* Deployed project using Vercel
* Prepared final documentation and presentation

## Current Status

✅ Project Completed  
✅ Ready for Final Submission