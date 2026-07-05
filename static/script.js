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
    const toast = document.getElementById('sample-toast');

    const samplePatients = [
        {
            name: 'Sample Patient 1',
            expectedResult: 'Benign',
            values: [
                8.671, 14.45, 54.42, 227.2, 0.0914, 0.0428, 0.0, 0.0, 0.1722, 0.0672,
                0.2204, 0.7873, 1.435, 11.36, 0.0092, 0.008, 0.0, 0.0, 0.0271, 0.0034,
                9.262, 17.04, 58.36, 259.2, 0.1162, 0.0706, 0.0, 0.0, 0.2592, 0.0785
            ]
        },
        {
            name: 'Sample Patient 2',
            expectedResult: 'Benign',
            values: [
                10.03, 21.28, 63.19, 307.3, 0.0812, 0.0391, 0.0025, 0.0052, 0.163, 0.0644,
                0.1851, 1.341, 1.184, 11.6, 0.0057, 0.0057, 0.0021, 0.0035, 0.0144, 0.0024,
                11.11, 28.94, 69.92, 376.3, 0.1126, 0.0709, 0.0124, 0.0258, 0.2349, 0.0806
            ]
        },
        {
            name: 'Sample Patient 3',
            expectedResult: 'Benign',
            values: [
                11.76, 21.6, 74.72, 427.9, 0.0864, 0.0497, 0.0166, 0.0112, 0.1495, 0.0589,
                0.4062, 1.21, 2.635, 28.47, 0.0059, 0.0098, 0.0117, 0.0074, 0.0241, 0.0018,
                12.98, 25.72, 82.98, 516.5, 0.1085, 0.0862, 0.0552, 0.0372, 0.2433, 0.0656
            ]
        },
        {
            name: 'Sample Patient 4',
            expectedResult: 'Benign',
            values: [
                16.17, 16.07, 106.3, 788.5, 0.0988, 0.1438, 0.0665, 0.054, 0.199, 0.0657,
                0.1745, 0.489, 1.349, 14.91, 0.0045, 0.0181, 0.0195, 0.012, 0.0193, 0.0037,
                16.97, 19.14, 113.1, 861.5, 0.1235, 0.255, 0.2114, 0.1251, 0.3153, 0.0896
            ]
        },
        {
            name: 'Sample Patient 5',
            expectedResult: 'Malignant',
            values: [
                17.99, 10.38, 122.8, 1001.0, 0.1184, 0.2776, 0.3001, 0.1471, 0.2419, 0.0787,
                1.095, 0.9053, 8.589, 153.4, 0.0064, 0.049, 0.0537, 0.0159, 0.03, 0.0062,
                25.38, 17.33, 184.6, 2019.0, 0.1622, 0.6656, 0.7119, 0.2654, 0.4601, 0.1189
            ]
        },
        {
            name: 'Sample Patient 6',
            expectedResult: 'Malignant',
            values: [
                20.57, 17.77, 132.9, 1326.0, 0.0847, 0.0786, 0.0869, 0.0702, 0.1812, 0.0567,
                0.5435, 0.7339, 3.398, 74.08, 0.0052, 0.0131, 0.0186, 0.0134, 0.0139, 0.0035,
                24.99, 23.41, 158.8, 1956.0, 0.1238, 0.1866, 0.2416, 0.186, 0.275, 0.089
            ]
        },
        {
            name: 'Sample Patient 7',
            expectedResult: 'Malignant',
            values: [
                12.45, 15.7, 82.57, 477.1, 0.1278, 0.17, 0.1578, 0.0809, 0.2087, 0.0761,
                0.3345, 0.8902, 2.217, 27.19, 0.0075, 0.0334, 0.0367, 0.0114, 0.0216, 0.0051,
                15.47, 23.75, 103.4, 741.6, 0.1791, 0.5249, 0.5355, 0.1741, 0.3985, 0.1244
            ]
        },
        {
            name: 'Sample Patient 8',
            expectedResult: 'Malignant',
            values: [
                13.61, 24.98, 88.05, 582.7, 0.0949, 0.0851, 0.0862, 0.0449, 0.1609, 0.0587,
                0.4565, 1.29, 2.861, 43.14, 0.0059, 0.0149, 0.0265, 0.0099, 0.0146, 0.0024,
                16.99, 35.27, 108.6, 906.5, 0.1265, 0.1943, 0.3169, 0.1184, 0.2651, 0.074
            ]
        }
    ];

    let lastSampleIndex = -1;

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

    function getRandomSampleIndex() {
        if (samplePatients.length <= 1) {
            return 0;
        }

        let nextIndex = Math.floor(Math.random() * samplePatients.length);
        if (nextIndex === lastSampleIndex) {
            nextIndex = (nextIndex + 1) % samplePatients.length;
        }

        lastSampleIndex = nextIndex;
        return nextIndex;
    }

    function populateSampleFields(values) {
        values.forEach((value, index) => {
            const input = document.querySelector(`input[name="feature_${index + 1}"]`);
            if (input) {
                input.value = value;
            }
        });
    }

    function showToast(message) {
        if (!toast) {
            return;
        }

        toast.textContent = message;
        toast.classList.remove('hidden');
        toast.classList.add('show');

        window.clearTimeout(showToast.hideTimer);
        showToast.hideTimer = window.setTimeout(() => {
            toast.classList.remove('show');
            window.setTimeout(() => {
                toast.classList.add('hidden');
            }, 250);
        }, 2600);
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

    fillSampleBtn.addEventListener('click', () => {
        const sampleIndex = getRandomSampleIndex();
        const samplePatient = samplePatients[sampleIndex];

        populateSampleFields(samplePatient.values);
        showToast(`Loaded ${samplePatient.name} (Expected: ${samplePatient.expectedResult})`);
    });
});