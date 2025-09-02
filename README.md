# Bike Share Toronto Analysis
Real-time map of Bike Share Toronto stations with short horizon forecasts. The app shows current availability and predicts the risk that a station will be empty or full in the next 10 to 20 minutes. Built as a small, clean monorepo with a FastAPI backend, a Python predictor worker, and a React frontend.

## My Goal
Go beyond a map and predictions. Explore optimizations for Bike Share Toronto and build rich visualizations and analyses.

## Features
- Live ingest from the official GBFS feed
- Map view with station status and risk badges
- Online learning that improves as data comes in
- Docker based local setup with one command. Planning to eventually host.
- Extra focus on optimization ideas and data visualization

## Data Source
GBFS root for Bike Share Toronto: https://tor.publicbikesystem.net/customer/gbfs/v2/gbfs.json