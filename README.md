# CV Transformation and Alignment Process

A web application that allows users to transform their CVs to align with specific job descriptions. The application enables users to upload their CV, provide a job description (either by pasting it or providing a URL), and get a transformed CV tailored to the target role.

## Features

- CV Upload: Users can upload their CV in various formats (DOCX, PDF, TXT).
- Job Description Input: Users can either paste a job description or provide a URL.
- Target Role Specification: Users can specify the target role for the CV transformation.
- CV Transformation: The application transforms the CV to align with the job description.
- Download Options: Users can download the transformed CV in Microsoft Word or PDF format.
- Previous Conversions: Users can view, download, and delete their previously transformed CVs.
- Data Deletion: Users can request the deletion of their data.

## Logic Modules

### Logic 1: CV Transformation Engine

The core transformation logic that analyzes the job description, extracts key skills and requirements, and aligns the CV content with these requirements. This includes:

- Extracting keywords and skills from the job description
- Analyzing the original CV content
- Generating a transformed CV that emphasizes relevant skills and experiences
- Formatting the output for readability and impact

## Technical Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: PostgreSQL
- File Handling: Multer for file uploads

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a PostgreSQL database named `cv_transformer`
4. Create the necessary tables:
   ```sql
   CREATE TABLE converted_cvs (
       id SERIAL PRIMARY KEY,
       user_id INT NOT NULL,
       cv_path TEXT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE deletion_requests (
       id SERIAL PRIMARY KEY,
       user_id INT NOT NULL,
       request_date DATE DEFAULT CURRENT_DATE,
       status VARCHAR(20) DEFAULT 'pending'
   );
   ```
5. Copy `.env.example` to `.env` and update the environment variables as needed
6. Start the server:
   ```
   npm start
   ```
7. Access the application at `http://localhost:3000`

## Usage

1. Upload your CV
2. Enter the job description (paste it or provide a URL)
3. Specify the target role
4. Click "Convert CV"
5. View the transformed CV
6. Download the CV in your preferred format (Word or PDF)
7. View and manage previous conversions

## Data Management

- Previous conversions are stored in the PostgreSQL database
- Users can delete any of their converted CVs
- Users can request the deletion of all their data
