document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const cvForm = document.getElementById('cvForm');
    const jdTextOption = document.getElementById('jdTextOption');
    const jdUrlOption = document.getElementById('jdUrlOption');
    const jdTextContainer = document.getElementById('jdTextContainer');
    const jdUrlContainer = document.getElementById('jdUrlContainer');
    const convertedCvDisplay = document.getElementById('convertedCvDisplay');
    const downloadOptions = document.querySelector('.download-options');
    const deletionRequestForm = document.getElementById('deletionRequestForm');
    const previousConversionsList = document.getElementById('previousConversionsList');
    
    // Current user ID (in a real application, this would come from authentication)
    const currentUserId = 1;
    
    // Toggle between job description input methods
    jdTextOption.addEventListener('change', function() {
        if (this.checked) {
            jdTextContainer.classList.remove('hidden');
            jdUrlContainer.classList.add('hidden');
        }
    });
    
    jdUrlOption.addEventListener('change', function() {
        if (this.checked) {
            jdTextContainer.classList.add('hidden');
            jdUrlContainer.classList.remove('hidden');
        }
    });
    
    // Handle CV form submission
    cvForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Get form data
        const formData = new FormData(cvForm);
        const cvFile = document.getElementById('cvUpload').files[0];
        const targetRole = document.getElementById('targetRole').value;
        let jobDescription = '';
        
        // Get job description based on selected option
        if (jdTextOption.checked) {
            jobDescription = document.getElementById('jdInput').value;
        } else {
            const jdUrl = document.getElementById('jdUrl').value;
            try {
                // In a real application, you would fetch the content from the URL
                // For this example, we'll simulate it
                jobDescription = await simulateFetchJobDescription(jdUrl);
            } catch (error) {
                alert('Error fetching job description from URL. Please check the URL and try again.');
                console.error('Error fetching job description:', error);
                return;
            }
        }
        
        // Validate inputs
        if (!cvFile) {
            alert('Please upload a CV file.');
            return;
        }
        
        if (!jobDescription) {
            alert('Please provide a job description.');
            return;
        }
        
        // Show loading state
        convertedCvDisplay.innerHTML = '<p class="placeholder">Converting your CV... Please wait.</p>';
        
        try {
            // Convert CV (in a real application, this would be an API call)
            const convertedCv = await convertCV(cvFile, jobDescription, targetRole);
            
            // Display the converted CV
            displayConvertedCV(convertedCv);
            
            // Show download options
            downloadOptions.classList.remove('hidden');
            
            // Save the conversion to the database (in a real application)
            saveConversion(convertedCv);
            
            // Refresh the list of previous conversions
            fetchPreviousConversions();
        } catch (error) {
            convertedCvDisplay.innerHTML = `<p class="error">Error converting CV: ${error.message}</p>`;
            console.error('Error converting CV:', error);
        }
    });
    
    // Handle deletion request form submission
    deletionRequestForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const userEmail = document.getElementById('userEmail').value;
        const requestReason = document.getElementById('requestReason').value;
        
        try {
            // In a real application, this would be an API call
            await submitDeletionRequest(userEmail, requestReason);
            alert('Your data deletion request has been submitted. We will process it shortly.');
            deletionRequestForm.reset();
        } catch (error) {
            alert('Error submitting deletion request. Please try again later.');
            console.error('Error submitting deletion request:', error);
        }
    });
    
    // Set up download buttons
    document.getElementById('downloadWord').addEventListener('click', function() {
        downloadConvertedCV('word');
    });
    
    document.getElementById('downloadPdf').addEventListener('click', function() {
        downloadConvertedCV('pdf');
    });
    
    // Fetch previous conversions on page load
    fetchPreviousConversions();
    
    // Function to convert CV (simulated)
    async function convertCV(cvFile, jobDescription, targetRole) {
        return new Promise((resolve) => {
            // Simulate API call delay
            setTimeout(() => {
                // Read the CV file
                const reader = new FileReader();
                reader.onload = function(e) {
                    const cvContent = e.target.result;
                    
                    // In a real application, this would be a complex transformation process
                    // For this example, we'll simulate the conversion
                    
                    // Extract skills from job description (simplified)
                    const skills = extractSkillsFromJobDescription(jobDescription);
                    
                    // Generate the converted CV content
                    const convertedCv = {
                        content: generateTransformedCV(cvContent, skills, targetRole || extractRoleFromJobDescription(jobDescription)),
                        timestamp: new Date().toISOString(),
                        targetRole: targetRole || extractRoleFromJobDescription(jobDescription)
                    };
                    
                    resolve(convertedCv);
                };
                reader.readAsText(cvFile);
            }, 2000); // Simulate 2-second delay
        });
    }
    
    // Function to display the converted CV
    function displayConvertedCV(convertedCv) {
        convertedCvDisplay.innerHTML = `
            <h3>${convertedCv.targetRole} CV</h3>
            <div class="cv-content">
                <pre>${convertedCv.content}</pre>
            </div>
            <p class="timestamp">Converted on: ${new Date(convertedCv.timestamp).toLocaleString()}</p>
        `;
    }
    
    // Function to download the converted CV
    function downloadConvertedCV(format) {
        // In a real application, this would generate the actual file
        // For this example, we'll simulate the download
        const convertedCvContent = document.querySelector('.cv-content pre').textContent;
        const targetRole = document.querySelector('#convertedCvDisplay h3').textContent.replace(' CV', '');
        
        const filename = `${targetRole.replace(/\s+/g, '_')}_CV.${format === 'word' ? 'docx' : 'pdf'}`;
        
        // Create a blob and download link
        const blob = new Blob([convertedCvContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Function to fetch previous conversions
    async function fetchPreviousConversions() {
        try {
            // In a real application, this would be an API call
            // For this example, we'll use simulated data
            const conversions = await simulateFetchConversions(currentUserId);
            
            if (conversions.length === 0) {
                previousConversionsList.innerHTML = '<p class="placeholder">No previous conversions found.</p>';
                return;
            }
            
            let html = '';
            conversions.forEach(conversion => {
                html += `
                    <div class="conversion-item" data-id="${conversion.id}">
                        <div class="conversion-info">
                            <h4>${conversion.targetRole} CV</h4>
                            <p>Converted on: ${new Date(conversion.timestamp).toLocaleString()}</p>
                        </div>
                        <div class="conversion-actions">
                            <button class="view-btn" onclick="viewConversion(${conversion.id})">View</button>
                            <button class="delete-btn" onclick="deleteConversion(${conversion.id})">Delete</button>
                        </div>
                    </div>
                `;
            });
            
            previousConversionsList.innerHTML = html;
        } catch (error) {
            previousConversionsList.innerHTML = '<p class="error">Error fetching previous conversions.</p>';
            console.error('Error fetching previous conversions:', error);
        }
    }
    
    // Function to submit a deletion request
    async function submitDeletionRequest(userEmail, reason) {
        // In a real application, this would be an API call
        return new Promise((resolve) => {
            // Simulate API call delay
            setTimeout(() => {
                console.log(`Deletion request submitted for ${userEmail}. Reason: ${reason}`);
                resolve();
            }, 1000);
        });
    }
    
    // Function to save a conversion
    async function saveConversion(convertedCv) {
        // In a real application, this would be an API call
        return new Promise((resolve) => {
            // Simulate API call delay
            setTimeout(() => {
                console.log('Conversion saved:', convertedCv);
                resolve();
            }, 500);
        });
    }
});

// Utility functions

// Simulate fetching job description from a URL
function simulateFetchJobDescription(url) {
    return new Promise((resolve, reject) => {
        // Simulate API call delay
        setTimeout(() => {
            if (!url || !url.startsWith('http')) {
                reject(new Error('Invalid URL'));
                return;
            }
            
            // Simulated job description
            const jobDescription = `
                Job Title: Senior Software Engineer
                
                Company: Tech Innovations Inc.
                
                About the Role:
                We are looking for a Senior Software Engineer to join our team. The ideal candidate will have experience with JavaScript, Node.js, and React. You will be responsible for developing and maintaining web applications, collaborating with cross-functional teams, and mentoring junior developers.
                
                Key Responsibilities:
                - Design, develop, and maintain web applications
                - Write clean, efficient, and reusable code
                - Collaborate with product managers, designers, and other engineers
                - Mentor junior developers
                
                Required Skills:
                - 5+ years of experience in software development
                - Strong proficiency in JavaScript, HTML, and CSS
                - Experience with Node.js and React
                - Familiarity with databases (SQL and NoSQL)
                - Knowledge of software development methodologies
                - Excellent problem-solving and communication skills
            `;
            
            resolve(jobDescription);
        }, 1500);
    });
}

// Simulate fetching previous conversions
function simulateFetchConversions(userId) {
    return new Promise((resolve) => {
        // Simulate API call delay
        setTimeout(() => {
            // Simulated conversions data
            const conversions = [
                {
                    id: 1,
                    userId: userId,
                    targetRole: 'Senior Software Engineer',
                    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                    cvPath: '/path/to/cv1.pdf'
                },
                {
                    id: 2,
                    userId: userId,
                    targetRole: 'Product Manager',
                    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                    cvPath: '/path/to/cv2.pdf'
                },
                {
                    id: 3,
                    userId: userId,
                    targetRole: 'Data Scientist',
                    timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
                    cvPath: '/path/to/cv3.pdf'
                }
            ];
            
            resolve(conversions);
        }, 1000);
    });
}

// Function to extract skills from job description
function extractSkillsFromJobDescription(jobDescription) {
    // In a real application, this would be more sophisticated
    // For this example, we'll use a simple regex to find keywords
    const skillsRegex = /Required Skills:[\s\S]*?((?:\s*-\s*.+)+)/i;
    const match = jobDescription.match(skillsRegex);
    
    if (match && match[1]) {
        return match[1]
            .split('\n')
            .filter(line => line.trim().startsWith('-'))
            .map(line => line.replace('-', '').trim());
    }
    
    return [];
}

// Function to extract the role from job description
function extractRoleFromJobDescription(jobDescription) {
    // In a real application, this would be more sophisticated
    // For this example, we'll use a simple regex to find the job title
    const titleRegex = /Job Title:\s*(.+?)(?:\r|\n|$)/i;
    const match = jobDescription.match(titleRegex);
    
    return match && match[1] ? match[1].trim() : 'Professional';
}

// Function to generate a transformed CV
function generateTransformedCV(originalCV, skills, targetRole) {
    // In a real application, this would be a sophisticated transformation
    // For this example, we'll do a simple transformation
    
    // Add a header with the target role
    let transformedCV = `${targetRole.toUpperCase()} CV\n\n`;
    
    // Add the original CV content
    transformedCV += originalCV;
    
    // Add a skills section highlighting the matching skills
    transformedCV += '\n\nKEY SKILLS MATCHED TO JOB DESCRIPTION:\n';
    skills.forEach(skill => {
        transformedCV += `- ${skill}\n`;
    });
    
    return transformedCV;
}

// Global functions for the onclick handlers
window.viewConversion = function(conversionId) {
    // In a real application, this would fetch the conversion details
    // For this example, we'll simulate it
    fetch(`/api/conversions/${conversionId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch conversion details');
            }
            return response.json();
        })
        .then(conversion => {
            // Display the conversion
            const convertedCvDisplay = document.getElementById('convertedCvDisplay');
            convertedCvDisplay.innerHTML = `
                <h3>${conversion.targetRole} CV</h3>
                <div class="cv-content">
                    <pre>${conversion.content}</pre>
                </div>
                <p class="timestamp">Converted on: ${new Date(conversion.timestamp).toLocaleString()}</p>
            `;
            
            // Show download options
            document.querySelector('.download-options').classList.remove('hidden');
            
            // Scroll to the converted CV section
            document.getElementById('convertedCvSection').scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Error viewing conversion:', error);
            alert('Error viewing conversion. Please try again later.');
        });
};

window.deleteConversion = function(conversionId) {
    if (confirm('Are you sure you want to delete this conversion? This action cannot be undone.')) {
        // In a real application, this would be an API call
        fetch(`/api/conversions/${conversionId}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete conversion');
                }
                
                // Remove the conversion from the UI
                const conversionElement = document.querySelector(`.conversion-item[data-id="${conversionId}"]`);
                if (conversionElement) {
                    conversionElement.remove();
                }
                
                // If no more conversions, show placeholder
                const conversionsList = document.getElementById('previousConversionsList');
                if (conversionsList.children.length === 0) {
                    conversionsList.innerHTML = '<p class="placeholder">No previous conversions found.</p>';
                }
                
                alert('Conversion deleted successfully.');
            })
            .catch(error => {
                console.error('Error deleting conversion:', error);
                alert('Error deleting conversion. Please try again later.');
            });
    }
};
