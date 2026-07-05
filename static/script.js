document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prediction-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');
    
    const resultSection = document.getElementById('result-section');
    const statusBadge = document.getElementById('status-badge');
    const probBenignBar = document.getElementById('prob-benign-bar');
    const probMalignantBar = document.getElementById('prob-malignant-bar');
    const probBenignText = document.getElementById('prob-benign-text');
    const probMalignantText = document.getElementById('prob-malignant-text');
    const recommendationText = document.getElementById('recommendation-text');
    const resetBtn = document.getElementById('reset-btn');
    const fillSampleBtn = document.getElementById('fill-sample');

    // Handle Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // UI Loading State
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        submitBtn.disabled = true;

        // Collect all 30 inputs
        const formData = new FormData(form);
        const jsonData = {};
        formData.forEach((value, key) => {
            jsonData[key] = parseFloat(value);
        });

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            });

            const data = await response.json();

            if (data.success) {
                displayResults(data);
            } else {
                alert('Analysis Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('A network error occurred. Please check the console.');
        } finally {
            // Reset Button State
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });

    function displayResults(data) {
        // Hide form, show result
        form.closest('.prediction-section').classList.add('hidden');
        resultSection.classList.remove('hidden');
        
        // Reset classes
        statusBadge.className = 'status-badge';
        
        // Update UI based on prediction
        if (data.prediction === 'Benign') {
            statusBadge.textContent = `BENIGN (${data.confidence}%)`;
            statusBadge.classList.add('is-benign');
            recommendationText.textContent = "The neural network analysis indicates normal cellular structures. Continued standard routine check-ups are recommended.";
        } else {
            statusBadge.textContent = `MALIGNANT (${data.confidence}%)`;
            statusBadge.classList.add('is-malignant');
            recommendationText.innerHTML = "<strong>Alert:</strong> The analysis identified anomalous cytological patterns. Immediate consultation with an oncologist or healthcare professional is strongly recommended.";
        }

        // Animate Progress Bars
        setTimeout(() => {
            probBenignBar.style.width = `${data.probabilities.benign}%`;
            probBenignText.textContent = `${data.probabilities.benign}%`;
            
            probMalignantBar.style.width = `${data.probabilities.malignant}%`;
            probMalignantText.textContent = `${data.probabilities.malignant}%`;
        }, 100);

        // Smooth scroll to results
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Reset Form for new patient
    resetBtn.addEventListener('click', () => {
        form.reset();
        probBenignBar.style.width = '0%';
        probMalignantBar.style.width = '0%';
        resultSection.classList.add('hidden');
        form.closest('.prediction-section').classList.remove('hidden');
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Helper: Fill form with sample data from your Notebook screenshot
    // Using the array values visible in Screenshot 171048.png for testing
    fillSampleBtn.addEventListener('click', () => {
        const sampleData = [
            11.76, 21.6, 74.72, 427.9, 0.08637, 0.04966, 0.01657, 0.01115, 0.1495, 0.05888, 
            0.4062, 1.21, 2.635, 28.47, 0.005857, 0.009758, 0.01168, 0.007445, 0.02406, 0.001769, 
            12.98, 25.72, 82.98, 516.5, 0.1085, 0.08615, 0.05523, 0.03715, 0.2433, 0.06563
        ];
        
        sampleData.forEach((val, index) => {
            const input = document.querySelector(`input[name="feature_${index + 1}"]`);
            if(input) input.value = val;
        });
    });
});