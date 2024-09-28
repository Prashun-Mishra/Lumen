# Lumen
It helps users find nearest electric vehicles charging stations from their entered location and also book them . It uses openchargeAPI , and HereMapAPI , which allows users to see the current status of the evStation whether it is available or not.  It also shows the charging speed and power of evStations. 
# EV Charging Stadium Locator

## Overview

The **EV Charging Stadium Locator** is a web application designed to help users locate electric vehicle (EV) charging stations near them. Utilizing the HERE API and Open Charge Map API, the application provides an intuitive interface for users to search for charging stations, view details, and book charging slots.

## Features

- **Interactive Map**: Displays nearby EV charging stations using HERE Maps.
- **Search Functionality**: Users can search for charging stations by entering their location.
- **Booking System**: Allows users to book charging stations by entering details such as EV model, date, and time.
- **Admin Portal**: Admin users can log in to manage the system and view bookings.
- **User Authentication**: Secure user login system with JWT for token-based authentication.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **APIs**:
  - HERE API for mapping
  - Open Charge Map API for charging station data

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or a cloud instance)
- HERE API Key
- Open Charge Map API Key

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd ev-charging-stadium-locator
