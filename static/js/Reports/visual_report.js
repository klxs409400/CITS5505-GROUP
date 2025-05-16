// Toggle explanation content
document.getElementById('toggleExplanation').addEventListener('click', function() {
    const content = document.getElementById('explanationContent');
    content.classList.toggle('show');
    
    const button = document.getElementById('toggleExplanation');
    if (content.classList.contains('show')) {
        button.innerHTML = '<i class="fas fa-times-circle"></i> Hide Scoring Criteria';
    } else {
        button.innerHTML = '<i class="fas fa-info-circle"></i> Show Scoring Criteria';
    }
});

// Toggle references content
document.getElementById('toggleReferences').addEventListener('click', function() {
    const content = document.getElementById('referencesContent');
    content.classList.toggle('show');
    
    const button = document.getElementById('toggleReferences');
    if (content.classList.contains('show')) {
        button.innerHTML = '<i class="fas fa-times-circle"></i> Hide References';
    } else {
        button.innerHTML = '<i class="fas fa-book"></i> Show References';
    }
});

// Initialize all charts and summary data when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Global variable to store sleep quality data for reuse
    let sleepQualityData = null;
    let durationData = null;
    let distributionData = null;
    let factorImpactData = null;
    
    // Load summary data
    Promise.all([
        fetch('/api/sleep/duration').then(res => res.json()),
        fetch('/api/sleep/score').then(res => res.json()),
        fetch('/api/sleep/level-distribution').then(res => res.json()),
        fetch('/api/sleep/factor-impact').then(res => res.json())
    ]).then(([durData, scoreData, distData, factorData]) => {
        // Store data for reuse
        durationData = durData;
        sleepQualityData = scoreData;
        distributionData = distData;
        factorImpactData = factorData;
        
        // Calculate average duration
        const durations = durationData.map(d => d.duration);
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        document.getElementById('avg-duration').textContent = avgDuration.toFixed(1) + 'h';
        
        // Calculate average quality score from Sleep Quality Trend data
        const scores = sleepQualityData.data;
        // 只计算非零评分的日期
        const validScores = scores.filter(score => score > 0);
        const avgScore = validScores.length > 0
            ? validScores.reduce((a, b) => a + b, 0) / validScores.length
            : 0;
        document.getElementById('avg-quality').textContent = Math.round(avgScore) + '/21';
        
        // Set quality text
        let qualityText = 'Poor quality sleep';
        if (avgScore >= 18) qualityText = 'Excellent quality sleep';
        else if (avgScore >= 14) qualityText = 'Good quality sleep';
        else if (avgScore >= 9) qualityText = 'Fair quality sleep';
        document.getElementById('quality-text').textContent = qualityText;
        
        // Find the most common sleep quality category from distribution data
        const total = distributionData.data.reduce((a, b) => a + b, 0);
        const categories = distributionData.labels; // ['Excellent', 'Good', 'Fair', 'Poor']
        const percentages = distributionData.data.map(value => Math.round((value / total) * 100));
        
        // Find the index of the category with the highest percentage
        const maxIndex = percentages.indexOf(Math.max(...percentages));
        const maxCategory = categories[maxIndex];
        const maxPercentage = percentages[maxIndex];
        
        // Update the main sleep issue card with the most common category
        document.getElementById('main-issue-pct').textContent = maxPercentage + '%';
        document.getElementById('main-issue-text').textContent = maxCategory + ' quality sleep';
        
        // 这部分代码将在updateTopSleepFactor函数中处理
        
        // Generate comprehensive analysis summary
        generateSleepAnalysisSummary(durData, scoreData, distData, factorData);
    });
    // Sleep Duration Chart
    fetch('/api/sleep/duration')
    .then(res => res.json())
    .then(data => {
        const labels = data.map(d => d.date);        // ['Mon', 'Tue', ...]
        const durations = data.map(d => d.duration); // [7, 6.5, ...]
        
        const ctx1 = document.getElementById('sleepDurationChart').getContext('2d');
        new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sleep Duration (hours)',
                data: durations,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            },
            plugins: {
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: 7,
                            yMax: 7,
                            borderColor: 'rgba(75, 192, 192, 0.7)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                content: 'Minimum Recommended (7h)',
                                display: true,
                                position: 'start'
                            }
                        },
                        line2: {
                            type: 'line',
                            yMin: 9,
                            yMax: 9,
                            borderColor: 'rgba(75, 192, 192, 0.7)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                content: 'Maximum Recommended (9h)',
                                display: true,
                                position: 'end'
                            }
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const value = context.raw;
                            if (value < 7) return 'Below recommended range';
                            if (value > 9) return 'Above recommended range';
                            return 'Within recommended range';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Hours',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#ffffff',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });
    });
    
    // Sleep Quality Chart
    fetch('/api/sleep/score')
    .then(response => response.json())
    .then(data => {
        // Store sleep quality data if not already stored
        if (!sleepQualityData) {
            sleepQualityData = data;
            
            // Update the summary card with the average score
            const scores = sleepQualityData.data;
            // 只计算非零评分的日期
            const validScores = scores.filter(score => score > 0);
            const avgScore = validScores.length > 0
                ? validScores.reduce((a, b) => a + b, 0) / validScores.length
                : 0;
            document.getElementById('avg-quality').textContent = Math.round(avgScore) + '/21';
            
            // Update quality text
            let qualityText = 'Poor quality sleep';
            if (avgScore >= 18) qualityText = 'Excellent quality sleep';
            else if (avgScore >= 14) qualityText = 'Good quality sleep';
            else if (avgScore >= 9) qualityText = 'Fair quality sleep';
            document.getElementById('quality-text').textContent = qualityText;
        }
        
        const ctx2 = document.getElementById('sleepQualityChart').getContext('2d');
        new Chart(ctx2, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Sleep Quality Trend (0-21)',
                data: data.data,
                borderColor: 'rgba(255, 99, 132, 0.8)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: 'white',
                pointBorderColor: 'rgba(255, 99, 132, 0.8)',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            },
            plugins: {
                annotation: {
                    annotations: {
                        zone1: {
                            type: 'box',
                            yMin: 0,
                            yMax: 8,
                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                            borderColor: 'rgba(255, 99, 132, 0.3)',
                            label: {
                                content: 'Poor',
                                display: true,
                                position: 'start'
                            }
                        },
                        zone2: {
                            type: 'box',
                            yMin: 9,
                            yMax: 13,
                            backgroundColor: 'rgba(255, 159, 64, 0.1)',
                            borderColor: 'rgba(255, 159, 64, 0.3)',
                            label: {
                                content: 'Fair',
                                display: true,
                                position: 'start'
                            }
                        },
                        zone3: {
                            type: 'box',
                            yMin: 14,
                            yMax: 17,
                            backgroundColor: 'rgba(255, 205, 86, 0.1)',
                            borderColor: 'rgba(255, 205, 86, 0.3)',
                            label: {
                                content: 'Good',
                                display: true,
                                position: 'start'
                            }
                        },
                        zone4: {
                            type: 'box',
                            yMin: 18,
                            yMax: 21,
                            backgroundColor: 'rgba(75, 192, 192, 0.1)',
                            borderColor: 'rgba(75, 192, 192, 0.3)',
                            label: {
                                content: 'Excellent',
                                display: true,
                                position: 'start'
                            }
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const value = context.raw;
                            if (value >= 18) return 'Quality: Excellent';
                            if (value >= 14) return 'Quality: Good';
                            if (value >= 9) return 'Quality: Fair';
                            return 'Quality: Poor';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 21,
                    title: {
                        display: true,
                        text: 'Score',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#ffffff',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });
    });
    
    // Sleep Quality Distribution Pie Chart
    fetch('/api/sleep/level-distribution')
    .then(response => response.json())
    .then(result => {
        const ctx3 = document.getElementById('sleepQualityPieChart').getContext('2d');
        new Chart(ctx3, {
        type: 'pie',
        data: {
            labels: result.labels,
            datasets: [{
                data: result.data,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',   // Excellent
                    'rgba(255, 205, 86, 0.7)',   // Good
                    'rgba(255, 159, 64, 0.7)',   // Fair
                    'rgba(255, 99, 132, 0.7)'    // Poor
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                animateRotate: true
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        generateLabels: function(chart) {
                            // 使用固定的标签
                            const colors = [
                                'rgba(75, 192, 192, 0.7)',   // Excellent
                                'rgba(255, 205, 86, 0.7)',   // Good
                                'rgba(255, 159, 64, 0.7)',   // Fair
                                'rgba(255, 99, 132, 0.7)'    // Poor
                            ];
                            const labels = ['Excellent', 'Good', 'Fair', 'Poor'];
                            
                            return labels.map((text, i) => ({
                                text: text,
                                fillStyle: colors[i],
                                strokeStyle: colors[i],
                                lineWidth: 1,
                                hidden: false,
                                fontColor: '#ffffff'
                            }));
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} nights (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
        });
    });
    
    // Factors Impact Chart
    fetch('/api/sleep/factor-impact')
    .then(response => response.json())
    .then(result => {
        const ctx4 = document.getElementById('factorsImpactChart').getContext('2d');
        
        // Use data from API instead of hardcoded values
        const factorData = result;
        
        // Update top sleep factor display
        updateTopSleepFactor(factorData);
        
        new Chart(ctx4, {
        type: 'bar',
        data: {
            labels: factorData.labels,
            datasets: [{
                label: 'Impact on Sleep Quality',
                data: factorData.data,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',  // Caffeine Intake
                    'rgba(54, 162, 235, 0.7)',  // Exercise
                    'rgba(153, 102, 255, 0.7)', // Screen Time
                    'rgba(255, 159, 64, 0.7)'   // Late-night Eating
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Factors Affecting Sleep Quality',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    color: '#ffffff'
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Impact Level: ${context.raw}/10`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Impact Level (0-10)',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ffffff',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
    
    // Sleep Dimensions Radar Chart removed as it used hardcoded data
});

// Add function to update Top Sleep Factor
function updateTopSleepFactor(data) {
    // Find the factor with the biggest impact
    const factorLabels = data.labels;
    const factorScores = data.data;
    
    // Find the index of the factor with the highest score
    const maxFactorIndex = factorScores.indexOf(Math.max(...factorScores));
    const maxFactor = factorLabels[maxFactorIndex];
    
    // Get factor mapping from database
    // Caffeine Intake: No intake = 2, Daytime only = 1, Nighttime = 0
    // Exercise: Intense night exercise = 0, Moderate daytime exercise = 2, No exercise = 1
    // Screen Time (Before Bed): ≤15min = 2, 15–60min = 1, >60min = 0
    // Late-night Eating: None = 2, Occasionally = 1, Often = 0
    
    // Get tips based on factor values
    const factorTips = {
        'Caffeine Intake': {
            2: 'No caffeine intake is excellent for sleep quality',
            1: 'Limiting caffeine to daytime only is good for sleep',
            0: 'Nighttime caffeine intake negatively impacts sleep quality'
        },
        'Exercise': {
            2: 'Moderate daytime exercise promotes better sleep',
            1: 'Consider adding moderate exercise to your routine',
            0: 'Intense night exercise can disrupt sleep patterns'
        },
        'Screen Time': {
            2: 'Minimal screen time before bed helps sleep quality',
            1: 'Try to further reduce screen time before bed',
            0: 'Extended screen time before bed disrupts sleep cycles'
        },
        'Late-night Eating': {
            2: 'Avoiding late-night eating benefits sleep quality',
            1: 'Try to reduce occasional late-night eating',
            0: 'Frequent late-night eating negatively impacts sleep'
        }
    };
    
    const factorIcons = {
        'Caffeine Intake': 'fa-mug-hot',
        'Exercise': 'fa-dumbbell',
        'Screen Time': 'fa-mobile-alt',
        'Late-night Eating': 'fa-utensils'
    };
    
    // Update the card showing the factor with the biggest impact
    const tipElement = document.querySelector('.summary-card:nth-child(4) .value i');
    tipElement.className = ''; // Clear existing classes
    tipElement.classList.add('fas', factorIcons[maxFactor]);
    
    // Get current factor value (0, 1, or 2)
    const factorValue = data.values ? data.values[maxFactorIndex] : 1; // Default to 1 if values not provided
    
    // Use factor and value to get specific tip
    const tip = factorTips[maxFactor] && factorTips[maxFactor][factorValue]
        ? factorTips[maxFactor][factorValue]
        : `Manage your ${maxFactor.toLowerCase()} for better sleep`;
    
    document.querySelector('.summary-card:nth-child(4) p').textContent = tip;
}

// Generate sleep analysis summary
function generateSleepAnalysisSummary(durationData, scoreData, distributionData, factorImpactData) {
    // Show loading indicator
    document.getElementById('summary-loading').classList.remove('hidden');
    document.getElementById('summary-text').classList.add('hidden');
    
    // Use data from API instead of hardcoded values
    // Calculate average sleep duration
    const durations = durationData.map(d => d.duration);
    const avgDuration = durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 7.6; // Default value
    
    // Calculate average sleep quality score
    const scores = scoreData.data;
    const validScores = scores.filter(score => score > 0);
    const avgScore = validScores.length > 0
        ? validScores.reduce((a, b) => a + b, 0) / validScores.length
        : 9; // Default value
    
    // Sleep quality distribution
    const categories = distributionData.labels || ['Excellent', 'Good', 'Fair', 'Poor'];
    const distributionValues = distributionData.data || [0, 80, 0, 20];
    const total = distributionValues.reduce((a, b) => a + b, 0);
    const percentages = distributionValues.map(value => Math.round((value / total) * 100));
    
    // Most common sleep quality category
    const maxIndex = percentages.indexOf(Math.max(...percentages));
    const maxCategory = categories[maxIndex];
    const maxPercentage = percentages[maxIndex];
    
    // Main factor affecting sleep
    const factorLabels = factorImpactData.labels || ['Caffeine Intake', 'Exercise', 'Screen Time', 'Late-night Eating'];
    const factorScores = factorImpactData.data || [9, 7, 6, 8];
    const factorValues = factorImpactData.values || [2, 1, 0, 2]; // Default mapping values
    
    // Find factor with highest impact
    const maxFactorIndex = factorScores.indexOf(Math.max(...factorScores));
    const maxFactor = factorLabels[maxFactorIndex];
    const maxFactorValue = factorValues[maxFactorIndex];
    
    // Fixed sleep trend to declining
    const trend = "declining";
    
    // Sleep duration assessment
    let durationAssessment = "";
    if (avgDuration >= 7 && avgDuration <= 9) {
        durationAssessment = "Your average sleep duration is within the recommended range (7-9 hours), which helps with physical recovery and cognitive function maintenance.";
    } else if (avgDuration < 7) {
        durationAssessment = "Your average sleep duration is below the recommended range (7-9 hours), which may lead to decreased attention and lowered immunity.";
    } else {
        durationAssessment = "Your average sleep duration exceeds the recommended range (7-9 hours), which may be associated with certain health issues.";
    }
    
    // Sleep quality assessment
    let qualityAssessment = "";
    if (avgScore >= 18) {
        qualityAssessment = "Your sleep quality score is excellent, indicating a high-quality sleep experience.";
    } else if (avgScore >= 14) {
        qualityAssessment = "Your sleep quality score is good, but there's still room for improvement.";
    } else if (avgScore >= 9) {
        qualityAssessment = "Your sleep quality score is fair. Consider paying attention to factors affecting your sleep.";
    } else {
        qualityAssessment = "Your sleep quality score is low. You may need to take measures to improve your sleep environment and habits.";
    }
    
    // Factor impact analysis - use same mapping as updateTopSleepFactor function
    const factorTips = {
        'Caffeine Intake': {
            2: 'No caffeine intake is excellent for sleep quality',
            1: 'Limiting caffeine to daytime only is good for sleep',
            0: 'Nighttime caffeine intake negatively impacts sleep quality'
        },
        'Exercise': {
            2: 'Moderate daytime exercise promotes better sleep',
            1: 'Consider adding moderate exercise to your routine',
            0: 'Intense night exercise can disrupt sleep patterns'
        },
        'Screen Time': {
            2: 'Minimal screen time before bed helps sleep quality',
            1: 'Try to further reduce screen time before bed',
            0: 'Extended screen time before bed disrupts sleep cycles'
        },
        'Late-night Eating': {
            2: 'Avoiding late-night eating benefits sleep quality',
            1: 'Try to reduce occasional late-night eating',
            0: 'Frequent late-night eating negatively impacts sleep'
        }
    };
    
    // Generate summary text
    let summaryText = `
        <h3>Sleep Overview</h3>
        <p>In the past week, your average sleep duration was <strong>${avgDuration.toFixed(1)} hours</strong>,
        with a sleep quality score of <strong>${Math.round(avgScore)}/21</strong>.
        Your sleep quality trend is <strong>${trend}</strong>.</p>
        
        <h3>Sleep Quality Distribution</h3>
        <p>You had <strong>${maxPercentage}%</strong> of nights with "${maxCategory}" sleep quality.
        ${categories.map((cat, i) => `${cat}: ${percentages[i]}%`).join(', ')}.</p>
        
        <h3>Assessment & Recommendations</h3>
        <p>${durationAssessment}</p>
        <p>${qualityAssessment}</p>
        <p>Data shows that <strong>${maxFactor}</strong> is the main factor affecting your sleep quality.
        Recommendation: ${factorTips[maxFactor] && factorTips[maxFactor][maxFactorValue]
            ? factorTips[maxFactor][maxFactorValue]
            : `Manage your ${maxFactor.toLowerCase()} for better sleep`}.</p>
        
        <h3>Areas for Improvement</h3>
        <ul>
            ${avgDuration < 7 ? '<li>Try going to bed earlier to ensure adequate sleep time</li>' : ''}
            ${avgDuration > 9 ? '<li>Avoid excessive sleep duration and maintain a regular sleep-wake cycle</li>' : ''}
            ${maxFactor === 'Caffeine Intake' && maxFactorValue < 2 ?
                `<li>${factorTips['Caffeine Intake'][2]}</li>` : ''}
            ${maxFactor === 'Exercise' && maxFactorValue < 2 ?
                `<li>${factorTips['Exercise'][2]}</li>` : ''}
            ${maxFactor === 'Screen Time' && maxFactorValue < 2 ?
                `<li>${factorTips['Screen Time'][2]}</li>` : ''}
            ${maxFactor === 'Late-night Eating' && maxFactorValue < 2 ?
                `<li>${factorTips['Late-night Eating'][2]}</li>` : ''}
            <li>Maintain a regular sleep schedule, including weekends</li>
            <li>Create a comfortable, quiet, and dark sleep environment</li>
        </ul>
    `;
    
    // Update DOM
    setTimeout(() => {
        document.getElementById('summary-loading').classList.add('hidden');
        const summaryTextElement = document.getElementById('summary-text');
        summaryTextElement.innerHTML = summaryText;
        summaryTextElement.classList.remove('hidden');
    }, 1000); // Add 1 second delay to show loading effect
}