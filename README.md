<img width="500" height="400" alt="image" src="https://github.com/user-attachments/assets/50099a4d-954e-4498-b512-10b21d74dad0" />

<img width="500" height="400" alt="image" src="https://github.com/user-attachments/assets/82cd2c0c-51e6-445f-be83-6d89ce9fc7a9" />


# 🐓 FeatherAI PoultryGuard (Poultry Guardian AI)

<p align="center">
  <img width="400" alt="Farmer Login Interface" src="https://github.com/user-attachments/assets/50099a4d-954e-4498-b512-10b21d74dad0" />
  <img width="500" alt="Farmer Dashboard Diagnostics" src="https://github.com/user-attachments/assets/82cd2c0c-51e6-445f-be83-6d89ce9fc7a9" />
</p>

FeatherAI PoultryGuard is a state-of-the-art, full-stack precision farming application designed to monitor, analyze, and secure broiler house atmosphere health. It uses a mathematical **Ensemble Random Forest Classifier** combined with **Google Gemini AI** to assess barn risks and deliver real-time, actionable husbandry recommendations to farmers.

---

## 🌟 Key Features

* **Ensemble Random Forest Classifier**: High-precision local Machine Learning model that classifies flock health risk based on ambient sensor inputs (Temperature, Humidity, CO₂, and Ammonia).
* **Gemini AI Diagnostics**: Dynamically generates expert veterinary summaries and environmental adjustments using Google's Gemini models (`gemini-flash-latest`, `gemini-3.1-flash-lite`, `gemini-3.5-flash` with automatic failover).
* **Robust Local Fallback**: Seamless offline support that automatically triggers premium scientific rule-based recommendations if the API key is missing or model endpoints are overloaded.
* **Interactive Telemetry Control**: Real-time sliders to override sensor values and trigger instant ML/AI diagnostics.
* **Historical Trends & Visualizations**: Responsive charts (using Recharts) mapping atmospheric trends, alongside telemetry logs with CSV download capabilities.
* **Multi-Lingual Localization**: Fully localized in multiple South Indian regional languages (Kannada, Tamil, Telugu, Malayalam, and English).
* **Premium User Interface**: Modern design supporting responsive layouts, dual theme options (light/dark mode), and a premium 3D developer card.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion (Framer Motion), Recharts, Lucide Icons.
* **Backend**: Node.js, Express, TypeScript, tsx.
* **Deployment**: Optimized for Vercel Serverless Functions.

---

## 💻 Local Installation & Setup

Follow these simple steps to spin up the full-stack app on your local machine:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 2. Clone and Install Dependencies
Clone the repository to your local drive and install node packages:
```bash
git clone https://github.com/RA2112702010007AD/Smart-Poultry-Health-Assistant.git
cd Smart-Poultry-Health-Assistant
npm install
